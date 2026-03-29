const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env variables manually (same pattern as fund-wise.js)
const envPath = path.join(__dirname, '../.env');
let env = {};

if (fs.existsSync(envPath)) {
    env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key.trim()] = value.trim().replace(/"/g, '');
        return acc;
    }, {});
}

// Get API token from command line argument or .env file
const API_TOKEN = process.argv[2] || env.WISE_API_TOKEN;

if (!API_TOKEN) {
    console.error("❌ Error: WISE_API_TOKEN is required");
    console.log("\nUsage:");
    console.log("  node scripts/get-wise-profile-id.js YOUR_API_TOKEN");
    console.log("  OR");
    console.log("  Add WISE_API_TOKEN to your .env file and run:");
    console.log("  node scripts/get-wise-profile-id.js");
    process.exit(1);
}

function request(path, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.sandbox.transferwise.tech',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
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
        req.end();
    });
}

async function run() {
    console.log("🔍 Fetching Wise Profile ID...\n");

    const response = await request('/v2/profiles', 'GET');

    if (response.status >= 200 && response.status < 300) {
        const profiles = response.body;

        if (Array.isArray(profiles) && profiles.length > 0) {
            console.log("✅ Profile(s) found:\n");

            profiles.forEach((profile, index) => {
                console.log(`Profile #${index + 1}:`);
                console.log(`  ID: ${profile.id}`);
                console.log(`  Type: ${profile.type}`);
                console.log(`  Name: ${profile.details?.firstName || ''} ${profile.details?.lastName || ''}`);
                console.log(`  Email: ${profile.details?.primaryAddress || 'N/A'}`);
                console.log("");
            });

            const primaryProfile = profiles[0];
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("📋 Add this to your .env file:");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`WISE_PROFILE_ID=${primaryProfile.id}`);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

            console.log("💡 Next Steps:");
            console.log("1. Copy the WISE_PROFILE_ID above");
            console.log("2. Add it to your .env file");
            console.log("3. Add it to Vercel environment variables");
            console.log("4. Run 'node scripts/fund-wise.js' to add test funds\n");

        } else {
            console.error("❌ No profiles found for this API token");
            console.log("\n💡 TIP: You may need to create a profile in the Wise Sandbox UI first:");
            console.log("   https://sandbox.transferwise.tech/\n");
        }
    } else {
        console.error("❌ Failed to fetch profiles");
        console.error("Status:", response.status);
        console.error("Response:", JSON.stringify(response.body, null, 2));

        if (response.status === 401) {
            console.log("\n💡 TIP: Your API token may be invalid or expired.");
            console.log("   Generate a new one at: https://sandbox.transferwise.tech/settings/api-tokens\n");
        }
    }
}

run().catch(err => {
    console.error("❌ Error:", err.message);
    process.exit(1);
});
