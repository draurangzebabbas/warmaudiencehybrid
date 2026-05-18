💡 How to use this in the future
If you add, change, or update any keys in .env.vercel, simply run:

powershell
# Sync to Vercel Production (Default)
node scripts/sync-vercel-env.js
# Sync to Vercel Preview
node scripts/sync-vercel-env.js .env.vercel preview
# Sync to Vercel Development
node scripts/sync-vercel-env.js .env.vercel development



-----------------------------
-----------------------------





# 🛠️ Scripts Documentation

This folder contains utility scripts for setting up and testing the Wise affiliate payout system.

## ⚠️ IMPORTANT: When to Use These Scripts

**These scripts are ONLY needed if:**
- ✅ You have set `NEXT_PUBLIC_AFFILIATE_ENABLED=true` in Vercel
- ✅ You want to implement automated affiliate payouts via Wise

**If you're NOT using the affiliate system, you can ignore this folder entirely.**

---

## 📋 Scripts Overview

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `get-wise-profile-id.js` | Fetch your Wise Profile ID using API token | **Step 2** - After getting API token |
| `fund-wise.js` | Add $1,000 test funds to your Wise Sandbox account | **Step 3** - After setting up .env |
| `simulate-webhook.js` | Simulate Wise webhook for local testing ONLY | **Local Dev Only** - When testing payouts on localhost |

**Note about `simulate-webhook.js`:**
- ⚠️ **ONLY needed for local development** (when running `npm run dev`)
- Wise Sandbox **cannot** send webhooks to `localhost:3000`
- In production/staging (Vercel), Wise sends real webhooks automatically
- You'll use this to manually complete payouts during local testing

---

## 🚀 Complete Setup Guide (Step-by-Step)

### Prerequisites
- Node.js installed
- Wise Sandbox account created at [sandbox.transferwise.tech](https://sandbox.transferwise.tech/)

---

### **Step 1: Create Wise API Token & Set UK Address**

**Part A: Create Wise Sandbox Account**

1. Go to [Wise Sandbox](https://sandbox.transferwise.tech/)
2. Sign up or log in
3. **⚠️ CRITICAL:** Set your address to **United Kingdom**:
   - Go to **Settings** → **Personal Details**
   - Set address to UK (example: 123 Baker Street, London, W1U 6AA, United Kingdom)
   - **Why UK?** Prevents PSD2 errors and works reliably in testing
   - **Skip verification** - Not needed in Sandbox

**Part B: Generate API Token**

4. Navigate to **Settings** → **API Tokens**
5. Click **Create API Token**
6. Select **Full Access** (required for payouts)
7. Copy the token (it looks like: `a3921d54-3f27-4274-9a84-c7474bffe4d5`)

**Example Output:**
```
✅ API Token Created: a3921d54-3f27-4274-9a84-c7474bffe4d5
```

**Add to your `.env` file NOW:**
```env
WISE_API_TOKEN=a3921d54-3f27-4274-9a84-c7474bffe4d5
WISE_ENVIRONMENT=sandbox
WISE_SOURCE_CURRENCY=USD
```

**⚠️ Important:** Setting UK address in Step 1 is critical - scripts CANNOT change it automatically!

---

### **Step 2: Get Your Wise Profile ID (Using Script)**

**⚠️ You CANNOT get this from Wise UI! You MUST use the script.**

Run this script to fetch your Profile ID:

```bash
node scripts/get-wise-profile-id.js
```

**The script will:**
- Read `WISE_API_TOKEN` from your `.env` file (you added it in Step 1)
- Call Wise API
- Display your Profile ID

**Example Output:**
```
🔍 Fetching Wise Profile ID...

✅ Profile(s) found:

Profile #1:
  ID: 29379523
  Type: PERSONAL
  Name:  
  Email: N/A

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Add this to your .env file:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WISE_PROFILE_ID=29379523
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Next Steps:
1. Copy the WISE_PROFILE_ID above
2. Add it to your .env file
3. Add it to Vercel environment variables
4. Run 'node scripts/fund-wise.js' to add test funds
```

**Add to your `.env` file:**
```env
WISE_PROFILE_ID=29379523
```

---

### **Step 3: Add Test Funds to Your Sandbox Account (Using Script)**

Now that you have both `WISE_API_TOKEN` and `WISE_PROFILE_ID` in your `.env` file, add test funds:

```bash
node scripts/fund-wise.js
```

**What this script does:**
1. Reads `WISE_API_TOKEN` and `WISE_PROFILE_ID` from `.env`
2. Checks if you have a USD balance account
3. Creates a USD balance if you don't have one
4. Adds **$1,000 in test funds** to your account

**Example Output:**
```
🔍 Step 1: Checking existing balances...
✅ USD Balance already exists.
💰 Step 3: Adding $1,000 to balance 12345678 via simulation...
✅ SUCCESS! $1,000 fake USD added to your account.
```

**Need more funds?** Just run the script again to add another $1,000.

---

### **Step 4: Test Wise Webhook (Optional - For Local Testing)**

This script simulates a Wise webhook to test payout completion locally.

**When to use:** After requesting a payout in your app, you'll get a Transfer ID. Use this script to simulate Wise confirming the payout.

```bash
node scripts/simulate-webhook.js YOUR_TRANSFER_ID
```

**Example:**
```bash
node scripts/simulate-webhook.js 123456789
```

**Example Output:**
```
🔌 Simulating Wise Webhook for Transfer ID: 123456789
Response: { received: true }
✅ Success! The system should now show the payout as 'Completed'.
```

**Note:** Make sure your Next.js dev server is running on `http://localhost:3000` before running this script.

---

## 📝 Complete Environment Variables Checklist

After running all scripts, your `.env` file should have:

```env
# Wise Configuration (ONLY if NEXT_PUBLIC_AFFILIATE_ENABLED=true)
WISE_API_TOKEN=a3921d54-3f27-4274-9a84-c7474bffe4d5
WISE_PROFILE_ID=29379523
WISE_ENVIRONMENT=sandbox
WISE_SOURCE_CURRENCY=USD
```

**Also add these to Vercel:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add all four WISE_* variables above

---

## 🔄 Workflow Summary

```
1. Create Wise Sandbox Account
   ↓
2. Generate API Token
   ↓ (Copy token)
3. Add WISE_API_TOKEN to .env
   ↓
4. Run: node scripts/get-wise-profile-id.js
   ↓ (Copy Profile ID)
5. Add WISE_PROFILE_ID to .env
   ↓
6. Run: node scripts/fund-wise.js
   ↓ (Account now has $1,000 test funds)
7. Add all WISE_* variables to Vercel
   ↓
8. Deploy your app
   ↓
9. Test affiliate payouts!
```

---

## 🆘 Troubleshooting

**Error: "WISE_API_TOKEN or WISE_PROFILE_ID missing in .env"**
- Make sure you've added both variables to your `.env` file
- Check for typos in variable names

**Error: "No profiles found for this API token"**
- Your API token may be invalid
- Generate a new token at: https://sandbox.transferwise.tech/settings/api-tokens

**Error: "Failed to create balance"**
- If you're in a restricted country (e.g., Pakistan), the script will automatically update your address to Singapore
- If it still fails, manually update your address in the Wise Sandbox UI to United Kingdom or Singapore

**Error: "Funding failed"**
- Make sure you're using the Sandbox environment, not Production
- Check that your API token has "Full Access" permissions

---

## 🎯 Production vs Sandbox

**For Testing (Current Setup):**
- Use `https://api.sandbox.transferwise.tech`
- Set `WISE_ENVIRONMENT=sandbox`
- Free test funds available
- No real money involved

**For Production (When Going Live):**
- Use `https://api.transferwise.com`
- Set `WISE_ENVIRONMENT=production`
- Generate production API token from [wise.com/settings/developer](https://wise.com/settings/developer)
- Real money will be transferred
- Requires verified Wise Business account

---

## ⚠️ Security Note

**Never commit your API tokens to Git!**
- The `.env` file is in `.gitignore` by default
- Always use environment variables for sensitive data
- Rotate your API tokens regularly

---

**Need Help?** Check the main [README.md](../README.md) for complete deployment instructions.
