const fetch = require('node-fetch');

// CONFIGURATION
// Replace this with the Transfer ID you see in your Console or Convex Dashboard
const REF_ID_TO_COMPLETE = process.argv[2];

if (!REF_ID_TO_COMPLETE) {
    console.error("❌ Please provide a Transfer ID.");
    console.log("Usage: node scripts/simulate-webhook.js <WISE_TRANSFER_ID>");
    process.exit(1);
}

const WEBHOOK_URL = "http://localhost:3000/api/webhooks/wise";

(async () => {
    console.log(`🔌 Simulating Wise Webhook for Transfer ID: ${REF_ID_TO_COMPLETE}`);

    const payload = {
        type: "transfer.state-change",
        occurred_at: new Date().toISOString(),
        data: {
            resource: {
                id: REF_ID_TO_COMPLETE,
                type: "transfer"
            },
            current_state: "outgoing_payment_sent", // This maps to "Completed" in our system
            previous_state: "processing"
        },
        subscription_id: "0000-simulated-webhook"
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log("Response:", result);

        if (response.ok) {
            console.log("✅ Success! The system should now show the payout as 'Completed'.");
        } else {
            console.error("❌ Failed:", result);
        }
    } catch (err) {
        console.error("❌ Network Error:", err.message);
        console.log("Make sure your Next.js server is running on http://localhost:3000");
    }
})();
