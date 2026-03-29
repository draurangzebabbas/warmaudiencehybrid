const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env variables manually for the script
const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key.trim()] = value.trim().replace(/"/g, '');
    return acc;
}, {});

const API_TOKEN = env.WISE_API_TOKEN;
const PROFILE_ID = env.WISE_PROFILE_ID;

if (!API_TOKEN || !PROFILE_ID) {
    console.error("❌ Error: WISE_API_TOKEN or WISE_PROFILE_ID missing in .env");
    process.exit(1);
}

function request(path, method, body = null) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const options = {
            hostname: 'api.sandbox.transferwise.tech',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'X-idempotence-uuid': require('crypto').randomUUID()
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(data);
        req.end();
    });
}

async function run() {
    console.log("🔍 Step 1: Checking existing balances...");
    const balances = await request(`/v4/profiles/${PROFILE_ID}/balances?types=STANDARD`, 'GET');

    let usdBalanceId = null;
    if (Array.isArray(balances.body)) {
        const usdBalance = balances.body.find(b => b.currency === 'USD');
        if (usdBalance) usdBalanceId = usdBalance.id;
    }

    if (!usdBalanceId) {
        console.log("🔓 Step 2: No USD balance found. Creating one now...");
        const create = await request(`/v4/profiles/${PROFILE_ID}/balances`, 'POST', {
            currency: 'USD',
            type: 'STANDARD'
        });
        if (create.status >= 200 && create.status < 300) {
            console.log("✅ USD Balance created successfully.");
            usdBalanceId = create.body.id;
        } else {
            console.error("❌ Failed to create balance:", create.body);
            console.log("\n💡 TIP: If you are in a restricted country (e.g. Pakistan), go to Settings in Wise Sandbox UI and set your address to United Kingdom first.");
            return;
        }
    } else {
        console.log("✅ USD Balance already exists.");
    }

    console.log(`💰 Step 3: Adding $1,000 to balance ${usdBalanceId} via simulation...`);
    const fund = await request('/v1/simulation/balance/topup', 'POST', {
        profileId: PROFILE_ID,
        balanceId: usdBalanceId,
        currency: 'USD',
        amount: 1000
    });

    if (fund.status >= 200 && fund.status < 300) {
        console.log("✅ SUCCESS! $1,000 fake USD added to your account.");
    } else {
        console.error("❌ Funding failed. Response:", fund.body);
    }
}

run();
