import crypto from "crypto";

// ===================================
// CONFIGURATION
// ===================================

const WISE_SANDBOX_URL = "https://api.sandbox.transferwise.tech";
const WISE_PROD_URL = "https://api.transferwise.com";

const getIsSandbox = () => {
    return process.env.WISE_ENVIRONMENT === "sandbox" || (process.env.WISE_API_TOKEN || "").includes("sandbox");
};

const getWiseUrl = () => {
    return getIsSandbox() ? WISE_SANDBOX_URL : WISE_PROD_URL;
};

// ===================================
// TYPES
// ===================================

interface PayoutParams {
    amount: number;
    recipientName: string;
    currency?: string;
    recipientId?: string; // Optional: If provided, skips creation
    // Bank details are now MANDATORY for all payouts
    bankDetails?: {
        country?: string; // ISO 2-letter
        currency?: string;
        accountNumber?: string;
        routingNumber?: string; // ABA for US
        iban?: string; // Europe/Global
        swiftCode?: string;
        city?: string;
        postCode?: string;
        firstLine?: string;
        state?: string;
    };
}

// ===================================
// HELPER: BALANCE CHECK
// ===================================

export async function getWiseBalance(currency: string = "USD") {
    const baseUrl = getWiseUrl();
    const token = process.env.WISE_API_TOKEN;
    const profileId = process.env.WISE_PROFILE_ID;

    if (!token || !profileId) return 0;

    try {
        const response = await fetch(`${baseUrl}/v4/profiles/${profileId}/balances?types=STANDARD`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const balances = await response.json();

        if (!Array.isArray(balances)) {
            console.error("❌ Wise Balance Error: Expected array but got:", JSON.stringify(balances));
            return 0;
        }

        const balance = balances.find((b: any) => b.currency === currency);
        return balance ? balance.amount.value : 0;
    } catch (error) {
        console.error("❌ Wise Balance Error:", error);
        return 0;
    }
}

// ===================================
// MAIN: CREATE PAYOUT
// ===================================

export async function createWisePayout({
    amount,
    recipientName,
    currency = "USD",
    bankDetails,
    recipientId
}: PayoutParams) {
    const baseUrl = getWiseUrl();
    const token = process.env.WISE_API_TOKEN;
    const profileId = process.env.WISE_PROFILE_ID;
    const isSandbox = getIsSandbox();

    if (!token || !profileId) {
        throw new Error("WISE_API_TOKEN or WISE_PROFILE_ID missing in environment variables.");
    }

    if (!bankDetails && !recipientId) {
        throw new Error("Bank details or Recipient ID are mandatory for Wise payouts. Email-only payouts are not supported.");
    }

    try {
        // 1. Create a Quote
        // ---------------------------------------------------------
        console.log(`1️⃣ Creating Quote for ${amount} ${currency}...`);
        const quoteResponse = await fetch(`${baseUrl}/v3/profiles/${profileId}/quotes`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sourceCurrency: currency,
                targetCurrency: currency,
                sourceAmount: amount,
            }),
        });

        const quote = await quoteResponse.json();
        if (!quoteResponse.ok) {
            throw new Error(`Wise Quote Error: ${quote.message || JSON.stringify(quote)}`);
        }
        console.log(`✅ Quote Created: ${quote.id}`);

        // 2. Prepare Recipient Payload
        // ---------------------------------------------------------
        // We strictly distinguish between IBAN (Europe/Global) and ABA (US).
        // Recipient structure MUST match Wise requirements exactly.

        let finalRecipientId = recipientId;

        if (finalRecipientId) {
            console.log(`2️⃣ Using Existing Recipient ID: ${finalRecipientId}`);
            // Skip fetching or creation
        } else {
            // 3. Create or Find Recipient
            // ---------------------------------------------------------
            if (!bankDetails) {
                throw new Error("Bank details are required to create a new recipient.");
            }

            console.log(`2️⃣ Creating/Finding Recipient...`);

            const accountType = bankDetails.iban ? "iban" : "aba";

            // Base payload
            let recipientPayload: any = {
                profileId: Number(profileId),
                accountHolderName: recipientName,
                currency: currency,
                type: accountType,
                details: {}
            };

            if (accountType === "iban") {
                recipientPayload.details = {
                    iban: bankDetails.iban,
                    legalType: "PRIVATE"
                };
            } else {
                // US / ABA
                recipientPayload.details = {
                    accountNumber: bankDetails.accountNumber,
                    abartn: bankDetails.routingNumber, // Correct field is 'abartn'
                    accountType: "CHECKING",
                    legalType: "PRIVATE",
                    address: {
                        country: "US",
                        city: bankDetails.city || "New York",
                        postCode: bankDetails.postCode || "10001",
                        firstLine: bankDetails.firstLine || "123 Test Street",
                        state: bankDetails.state || "NY"
                    }
                };
            }

            // Ensure no idempotency header conflicts if retrying rapidly
            const recipientResponse = await fetch(`${baseUrl}/v1/accounts`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(recipientPayload),
            });

            let recipient = await recipientResponse.json();

            if (!recipientResponse.ok) {
                // Handle Deduplication (409 Conflict) manually if Wise complains
                if (recipientResponse.status === 409 || (recipient.message && recipient.message.includes("already exists"))) {
                    console.log("ℹ️ Recipient already exists. Fetching list to find ID...");
                    // Note: In a real DB, you should store recipientId to avoid this lookup
                    const searchResponse = await fetch(`${baseUrl}/v1/accounts?profile=${profileId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    const accounts = await searchResponse.json();

                    const existing = Array.isArray(accounts) ? accounts.find((a: any) => {
                        return a.accountHolderName === recipientName && a.currency === currency;
                    }) : null;

                    if (existing) {
                        finalRecipientId = existing.id;
                        console.log(`✅ Found Existing Recipient: ${finalRecipientId}`);
                    } else {
                        throw new Error(`Wise Recipient Conflict: Could not resolve existing recipient ID.`);
                    }
                } else {
                    console.error("PAYLOAD WAS:", JSON.stringify(recipientPayload, null, 2));
                    throw new Error(`Wise Recipient Error: ${recipient.message || JSON.stringify(recipient)}`);
                }
            } else {
                finalRecipientId = recipient.id;
                console.log(`✅ Recipient Created: ${finalRecipientId}`);
            }
        }

        // 4. Create the Transfer
        // ---------------------------------------------------------
        console.log(`3️⃣ Creating Transfer...`);

        // SANDBOX NOTE: We DO NOT bypass here anymore. We test the REAL transfer creation flow.

        const transferResponse = await fetch(`${baseUrl}/v1/transfers`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "X-idempotence-uuid": crypto.randomUUID()
            },
            body: JSON.stringify({
                targetAccount: finalRecipientId,
                quoteUuid: quote.id,
                customerTransactionId: crypto.randomUUID(),
                details: {
                    reference: "AFF-PAYOUT", // Max 10 chars safe for US/ACH
                    transferPurpose: "verification.service", // Common valid purpose
                    sourceOfFunds: "other"
                }
            }),
        });

        const transfer = await transferResponse.json();
        if (!transferResponse.ok) {
            throw new Error(`Wise Transfer Error: ${transfer.message || JSON.stringify(transfer)}`);
        }
        console.log(`✅ Transfer Created: ${transfer.id}`);

        // 5. Fund the Transfer
        // ---------------------------------------------------------
        console.log(`4️⃣ Funding Transfer...`);

        const payResponse = await fetch(`${baseUrl}/v3/profiles/${profileId}/transfers/${transfer.id}/payments`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "BALANCE",
            }),
        });

        let pay = await payResponse.json();

        // SANDBOX-ONLY: Handle SCA/Funding Simulation
        if (!payResponse.ok && pay.error === "forbidden" && isSandbox) {
            console.log("⚠️ [Wise Sandbox] Payment forbidden (SCA). Simulating processing...");

            await fetch(`${baseUrl}/v1/simulation/transfers/${transfer.id}/processing`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            await fetch(`${baseUrl}/v1/simulation/transfers/${transfer.id}/funds_converted`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const simulatePay = await fetch(`${baseUrl}/v1/simulation/transfers/${transfer.id}/outgoing_payment_sent`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (simulatePay.ok) {
                pay = { status: "COMPLETED" };
                console.log(`✅ [Sandbox] Transfer Simulated to Completion`);
            } else {
                const simError = await simulatePay.json();
                throw new Error(`Wise Simulation Error: ${JSON.stringify(simError)}`);
            }
        } else if (!payResponse.ok) {
            throw new Error(`Wise Payment Error: ${pay.message || JSON.stringify(pay)}`);
        }

        return {
            success: true,
            transferId: String(transfer.id),
            recipientId: String(finalRecipientId), // Return for saving
            status: transfer.status || "PROCESSING",
            quoteId: String(quote.id),
            paymentStatus: pay.status || "PROCESSING"
        };

    } catch (error: any) {
        console.error("❌ Wise Payout Exception:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}
