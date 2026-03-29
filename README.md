# 🚀 SaaS Boilerplate - Complete Production Deployment Guide

This is the **definitive guide** for deploying your SaaS from local development to production. Follow each section carefully.

---

## 📋 Table of Contents
1. [Local Development Setup](#-local-development-setup)
2. [Convex Configuration](#-convex-configuration)
3. [Vercel Configuration](#-vercel-configuration)
4. [Render Configuration](#-render-configuration-backend)
5. [Polar Setup & Webhooks](#-polar-setup--webhooks)
6. [Wise Setup (Optional)](#-wise-setup-optional---for-affiliate-payouts)
7. [Google OAuth Setup](#-google-oauth-setup)
8. [Final Deployment Checklist](#-final-deployment-checklist)

---

## 🏠 Local Development Setup

### Step 1: Clone and Install
```bash
git clone <your-repo-url>
cd saas-boilerplate
npm install
```

### Step 2: Initialize Convex
```bash
npx convex dev
```
This will:
- Open your browser to log in to Convex
- Create a new project
- Generate a `.env.local` file with `NEXT_PUBLIC_CONVEX_URL`

### Step 3: Create Local Environment File
```bash
cp .env.example .env.local
```

### Step 4: Run Development Server
```bash
npm run dev
```
Your app will be at `http://localhost:3000`

---

## 🗄️ Convex Configuration

**Where to configure:** [Convex Dashboard](https://dashboard.convex.dev/) → Your Project → **Settings** → **Environment Variables**

### Environment Variables for Convex

| Variable | How to get it | Required |
|----------|---------------|----------|
| `BETTER_AUTH_SECRET` | Run `openssl rand -base64 32` in terminal | ✅ Yes |
| `BETTER_AUTH_URL` | **Local:** `http://localhost:3000`<br>**Production:** `https://your-app.vercel.app` | ✅ Yes |
| `SITE_URL` | **Local:** `http://localhost:3000`<br>**Production:** `https://your-app.vercel.app` | ✅ Yes |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth Client | ✅ Yes |
| `GOOGLE_CLIENT_SECRET` | Same as above | ✅ Yes |
| `RESEND_API_KEY` | [Resend Dashboard](https://resend.com/api-keys) → Create API Key | ✅ Yes |
| `RESEND_FROM_NAME` | The display name for emails (e.g., "Article Writer") | ✅ Yes |
| `RESEND_FROM_EMAIL` | Your verified domain email (e.g., "noreply@yourdomain.com") | ✅ Yes |
| `POLAR_ACCESS_TOKEN` | [Polar Dashboard](https://polar.sh/settings) → Developer → Personal Access Token | ✅ Yes |
| `POLAR_ORGANIZATION_ID` | Found in Polar Dashboard URL: `polar.sh/[your-org-id]` | ✅ Yes |
| `NEXT_PUBLIC_POLAR_SANDBOX` | Set to `true` for testing or `false` for production | ✅ Yes |
| `POLAR_WEBHOOK_SECRET` | Created in Polar Webhooks (see Polar section below) | ✅ Yes |
| `NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH` | Product ID from Polar Dashboard for Growth plan | ✅ Yes |
| `NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE` | Product ID from Polar Dashboard for Scale plan | ✅ Yes |
| `NEXT_PUBLIC_RENDER_BACKEND_URL` | Your Render backend URL (e.g., `https://your-app.onrender.com`) | ⚠️ Optional |

**Important Notes:**
- All these variables must be set in Convex Dashboard for the backend to work
- `BETTER_AUTH_URL` and `SITE_URL` must match your production domain exactly (no trailing slash)
- For local development, use `http://localhost:3000`
- WISE variables are NOT needed in Convex - they're only used in Vercel for affiliate payouts

---

## ⚡ Vercel Configuration

**Where to configure:** [Vercel Dashboard](https://vercel.com/) → Your Project → **Settings** → **Environment Variables**

### Core Environment Variables (Required)

| Variable | Value | How to get it |
|----------|-------|---------------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://your-deployment.convex.cloud` | From Convex Dashboard → Settings → Production URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://your-deployment.convex.site` | From Convex Dashboard → Settings → Deployment URL |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `https://your-app.vercel.app` | Same as above |
| `BETTER_AUTH_SECRET` | Same as Convex | Run `openssl rand -base64 32` |
| `SITE_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |
| `GOOGLE_CLIENT_ID` | Same as Convex | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Same as Convex | From Google Cloud Console |
| `POLAR_ACCESS_TOKEN` | Same as Convex | From Polar Dashboard |
| `POLAR_ORGANIZATION_ID` | Same as Convex | From Polar Dashboard |
| `NEXT_PUBLIC_POLAR_SANDBOX` | `true` or `false` | `true` for testing, `false` for production |
| `NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH` | Product ID | From Polar Dashboard for Growth plan |
| `NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE` | Product ID | From Polar Dashboard for Scale plan |
| `RESEND_API_KEY` | Same as Convex | From Resend Dashboard |
| `RESEND_FROM_NAME` | Same as Convex | Display name for emails |
| `RESEND_FROM_EMAIL` | Same as Convex | Verified sending email |
| `NEXT_PUBLIC_LANDING_VIDEO_URL` | YouTube URL | Your landing page video URL (optional) |

### Optional: Newsletter Integration (Beehiiv)

| Variable | Value | How to get it |
|----------|-------|---------------|
| `BEEHIIV_API_KEY` | From Beehiiv | [Beehiiv Settings](https://app.beehiiv.com/) → Integrations |
| `BEEHIIV_PUBLICATION_ID` | From Beehiiv | Found in Beehiiv Settings (starts with `pub_`) |
| `BEEHIIV_UTM_SOURCE` | Your choice | e.g., `saas-landing` |
| `NEXT_PUBLIC_BEEHIIV_ATTRIBUTION` | `true` | Enables tracking script |

### Optional: Backend Service (Render)

| Variable | Value | How to get it |
|----------|-------|---------------|
| `NEXT_PUBLIC_RENDER_BACKEND_URL` | `https://your-backend.onrender.com` | From Render deployment (see Render section) |

### Optional: Affiliate System

**Note:** Only add these if you want to enable the affiliate program. Set `NEXT_PUBLIC_AFFILIATE_ENABLED=false` to disable all affiliate features.

| Variable | Value | How to get it |
|----------|-------|---------------|
| `NEXT_PUBLIC_AFFILIATE_ENABLED` | `true` or `false` | Set to `false` to disable affiliate features |
| `AFFILIATE_COMMISSION_RATE` | `30` | Percentage (e.g., 30 = 30%) |
| `AFFILIATE_PAYOUT_MINIMUM` | `50` | Minimum USD for payout |
| `AFFILIATE_COOKIE_DAYS` | `60` | Days to track referrals |
| `WISE_ENVIRONMENT` | `sandbox` or `production` | Match your Wise setup |
| `WISE_API_TOKEN` | From Wise | [Wise Sandbox](https://sandbox.transferwise.tech/) or [Wise Production](https://wise.com/settings/developer) |
| `WISE_PROFILE_ID` | From Wise | Found in Wise account settings |
| `WISE_SOURCE_CURRENCY` | `USD` | Your currency |
| `PAYOUTS_ENABLED` | `true` or `false` | Set to `true` to enable automated Wise payouts |

**Important Notes:**
- `NEXT_PUBLIC_*` variables are exposed to the browser
- All URLs must use `https://` in production (no `http://`)
- Make sure `NEXT_PUBLIC_CONVEX_URL` points to your **production** Convex deployment
- Affiliate variables are ONLY needed if `NEXT_PUBLIC_AFFILIATE_ENABLED=true`

---

## 🖥️ Render Configuration (Backend)

**Where to configure:** [Render Dashboard](https://dashboard.render.com/) → **New** → **Web Service**

### Render Setup Steps

1. **Connect Repository:** Link your GitHub repository.
2. **Root Directory:** Set this to `backend` (⚠️ Very Important: If you don't set this, the deployment will fail).
3. **Build Command:** `npm install`
4. **Start Command:** `node index.js`
5. **Environment:** Select **Node**.

### Environment Variables for Render

| Variable | Value | How to get it |
|----------|-------|---------------|
| `PORT` | `3000` | Leave as default or set custom |
| `NODE_ENV` | `production` | Set to production |

---

## 💓 Automation Heartbeat (Keep-Alive)

Because Render's Free Tier sleeps after 15 minutes of inactivity, we use a "Heartbeat" to keep it awake 24/7. This ensures your articles are written even when your laptop is closed.

### Step 1: Set URL in Convex
Go to **Convex Dashboard** → **Settings** → **Environment Variables** and add:

*   **Variable Name:** `NEXT_PUBLIC_RENDER_BACKEND_URL`
*   **Value:** `https://your-backend.onrender.com` (Your actual Render URL)

### Step 2: Deploy Crons
Run the following in your terminal to activate the 10-minute "Poke" schedule:
```bash
npx convex deploy
```

**Note:** The system is now configured to "poke" the backend every 10 minutes. This resets Render's sleep timer, keeping your Automation Engine active forever.

---

## 💳 Polar Setup & Webhooks

### Step 1: Create Products & Configure

#### **Part A: Create Products in Polar Dashboard**

1. Go to [Polar Dashboard](https://polar.sh/) (or [Sandbox](https://sandbox.polar.sh/) for testing)
2. Navigate to **Products** → **Create Product**
3. Create your subscription products (e.g., Growth Plan, Scale Plan)
4. Copy each **Product ID** (looks like `e34c83ec-a71f-4b6f-ad7c-c911195adf2e`)

#### **Part B: Add Product IDs to Environment Variables**

**IMPORTANT:** Product IDs must be set in **BOTH** places:

**1. Add to `.env` (for local development):**
```bash
NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH="e34c83ec-a71f-4b6f-ad7c-c911195adf2e"
NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE="e28c30b6-21fb-47d1-8b61-647e15a3b5f7"
```

**2. Add to Convex Dashboard** (Settings → Environment Variables):
```bash
NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH=e34c83ec-a71f-4b6f-ad7c-c911195adf2e
NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE=e28c30b6-21fb-47d1-8b61-647e15a3b5f7
```

**3. Add to Vercel** (Settings → Environment Variables):
```bash
NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH=e34c83ec-a71f-4b6f-ad7c-c911195adf2e
NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE=e28c30b6-21fb-47d1-8b61-647e15a3b5f7
```

#### **Part C: Update Code Configuration**

The product IDs are already configured in `convex/auth.ts` to use environment variables:

```typescript
checkout({
    products: [
        {
            productId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH!,
            slug: "growth"  // Used in checkout URL
        },
        {
            productId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_SCALE!,
            slug: "scale"  // Used in checkout URL
        }
    ],
    successUrl: `${process.env.BETTER_AUTH_URL}/dashboard?checkout_id={CHECKOUT_ID}`,
    authenticatedUsersOnly: true
}),
```

**Understanding the Configuration:**
- **`productId`**: References the environment variable containing the Polar Product ID
- **`slug`**: A short URL-friendly name (lowercase, no spaces)
  - The slug becomes part of the checkout URL
  - Example: `slug: "pro"` → checkout at `/api/auth/checkout?slug=pro`
  - Keep slugs simple: "pro", "unlimited", "enterprise", etc.

#### **Part D: Update Pricing Component**

The pricing component in `components/pricing.tsx` is already configured to use these environment variables:

```typescript
// The component passes the product ID when user clicks subscribe
handleCheckout("growth", process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_GROWTH!)
```

---

### 🎯 Adding More Subscription Plans

Want to add an "Enterprise" plan or more tiers? Follow these steps:

#### **Step 1: Create Product in Polar**
1. Go to Polar Dashboard → Products → Create Product
2. Set up your new plan (e.g., "Enterprise - $199/month")
3. Copy the Product ID

#### **Step 2: Add Environment Variable**

Add to all three places:

**`.env`:**
```bash
NEXT_PUBLIC_POLAR_PRODUCT_ID_ENTERPRISE="your-new-product-id-here"
```

**Convex Dashboard:**
```bash
NEXT_PUBLIC_POLAR_PRODUCT_ID_ENTERPRISE=your-new-product-id-here
```

**Vercel:**
```bash
NEXT_PUBLIC_POLAR_PRODUCT_ID_ENTERPRISE=your-new-product-id-here
```

#### **Step 3: Update `convex/auth.ts`**

Add the new product to the checkout configuration:

```typescript
checkout({
    products: [
        {
            productId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO!,
            slug: "pro"
        },
        {
            productId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_UNLIMITED!,
            slug: "unlimited"
        },
        {
            productId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_ENTERPRISE!,
            slug: "enterprise"  // New plan
        }
    ],
    successUrl: `${process.env.BETTER_AUTH_URL}/dashboard?checkout_id={CHECKOUT_ID}`,
    authenticatedUsersOnly: true
}),
```

#### **Step 4: Update `components/pricing.tsx`**

Add a new pricing card for your Enterprise plan:

```tsx
{/* Enterprise Plan */}
<Card className="...">
    <CardHeader>
        <CardTitle>Enterprise</CardTitle>
        <CardDescription>For large teams</CardDescription>
        <div className="mt-4 flex items-baseline gap-x-2">
            <span className="text-4xl font-bold">$199</span>
            <span className="text-muted-foreground">/month</span>
        </div>
        <Button
            onClick={() => handleCheckout("enterprise", process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_ENTERPRISE!)}
            disabled={loading === "enterprise" || activeSubscription === "enterprise"}
        >
            {loading === "enterprise" ? "Processing..." : "Get Enterprise"}
        </Button>
    </CardHeader>
    <CardContent>
        {/* Add your features list */}
    </CardContent>
</Card>
```

#### **Step 5: Update Subscription Detection**

In `components/pricing.tsx`, add detection for the new plan:

```typescript
if (pId === process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_ENTERPRISE) {
    setActiveSubscription("enterprise");
}
```

#### **Step 6: Deploy Changes**

```bash
# Deploy to Convex
npx convex deploy

# Deploy to Vercel (push to git)
git add .
git commit -m "Added Enterprise plan"
git push origin main
```

---

### ⚠️ Why Product IDs Must Be in Both Frontend & Backend

**Frontend (Vercel/.env):**
- The pricing component needs the product ID to send to the checkout
- Used in browser JavaScript when user clicks "Subscribe"

**Backend (Convex):**
- Validates that the requested product is allowed
- Creates the checkout session with Polar
- **If missing here, you'll get "Product not found" error** ❌

**Think of it like a security check:**
```
User clicks Subscribe → Frontend sends product ID → Backend validates "Is this allowed?" → Creates checkout
```

If the backend doesn't know about the product ID, it rejects the request for security.

---

### Step 2: Configure Webhooks (ONE Webhook for Everything)

**Location:** Polar Dashboard → **Settings** → **Developer** → **Webhooks**

---

#### 🔹 **Authoritative Webhook** (Required for Subscriptions & Affiliates)

This single webhook endpoint handles your entire application logic including subscription updates and affiliate commission tracking.

| Setting | Value |
|---------|-------|
| **Endpoint URL** | `https://your-convex-deployment.convex.site/polar-webhook` |
| **Events to Subscribe** | ✅ `order.created`<br>✅ `order.paid`<br>✅ `subscription.created`<br>✅ `subscription.updated`<br>✅ `subscription.canceled` |
| **Description** | Authoritative Webhook |

**After Creating the Webhook:**
1. Click on the webhook you just created
2. Copy the **Webhook Secret** (starts with `polar_whs_...`)
3. Add this secret to **Convex Dashboard** as `POLAR_WEBHOOK_SECRET`
   - Go to: https://dashboard.convex.dev/
   - Settings → Environment Variables

**How to find your Convex webhook URL:**
- Go to Convex Dashboard → Your Project → Settings
- Your deployment URL is like: `https://your-deployment.convex.site`
- The endpoint is exactly: `https://your-deployment.convex.site/polar-webhook` (POST)

---

### 📋 Summary: One Webhook, One Secret

| Webhook | Endpoint | Secret Name | Where to Add |
|---------|----------|-------------|--------------|
| **Authoritative Webhook** | `https://your-convex.convex.site/polar-webhook` | `POLAR_WEBHOOK_SECRET` | Convex Dashboard |

**Important Notes:**
- If using Sandbox, create the webhook in [sandbox.polar.sh](https://sandbox.polar.sh/)
- If using Production, create it in [polar.sh](https://polar.sh/)
- This webhook is REQUIRED for the app to work and it now handles affiliate tracking automatically on the backend.

---

## 💰 Wise Setup (⚠️ OPTIONAL - Only for Affiliate Payouts)

### ⚠️ When Do You Need This?

**You ONLY need Wise if:**
- ✅ You set `NEXT_PUBLIC_AFFILIATE_ENABLED=true` in Vercel

**You DON'T need Wise if:**
- ❌ You're not using the affiliate system
- ❌ You're okay with manual affiliate payouts

**Note:** The affiliate system tracks commissions perfectly fine WITHOUT Wise. Wise is only for automating the payout process.

---

### 📋 Complete Wise Setup Guide (Follow This Exact Order)

#### **Step 1: Create Wise Sandbox Account & Set Address**

1. Go to [Wise Sandbox](https://sandbox.transferwise.tech/)
2. Click **Sign Up** and create a free account
3. **⚠️ IMPORTANT:** During or immediately after signup:
   - Go to **Settings** → **Personal Details**
   - Set your address to **United Kingdom** (or any non-restricted country)
   - Example address:
     ```
     123 Baker Street
     London, W1U 6AA
     United Kingdom
     ```
   - **Why UK?** Avoids PSD2 restrictions and works reliably in testing
   - **Skip verification** - Not needed in Sandbox mode

**Why this matters:** Scripts cannot change your address automatically. Setting it to UK upfront prevents API errors later.

---

#### **Step 2: Generate API Token**

1. In Wise Sandbox, navigate to **Settings** → **API Tokens**
2. Click **Create API Token**
3. Select **Full Access** (required for creating transfers)
4. Give it a name like "SaaS Boilerplate Dev"
5. Click **Create**
6. **Copy the token immediately** (you won't see it again!)

**Example Token:**
```
a3921d54-3f27-4274-9a84-c7474bffe4d5
```

**Add to your `.env` file RIGHT NOW:**
```env
WISE_API_TOKEN=a3921d54-3f27-4274-9a84-c7474bffe4d5
WISE_ENVIRONMENT=sandbox
WISE_SOURCE_CURRENCY=USD
```

---

#### **Step 3: Get Your Profile ID (Using Script)**

**⚠️ IMPORTANT:** You CANNOT get this from Wise UI - you MUST use the script!

Run this command in your terminal:
```bash
node scripts/get-wise-profile-id.js
```

**The script will:**
- Read `WISE_API_TOKEN` from your `.env` file
- Call Wise API to fetch your profile
- Display your Profile ID

**Example Output:**
```
🔍 Fetching Wise Profile ID...

✅ Profile(s) found:

Profile #1:
  ID: 29379523
  Type: PERSONAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Add this to your .env file:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WISE_PROFILE_ID=29379523
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Copy the ID and add to your `.env` file:**
```env
WISE_PROFILE_ID=29379523
```

---

#### **Step 4: Add Test Funds (Using Script)**

Now add fake money to your Sandbox account.

Run this command:
```bash
node scripts/fund-wise.js
```

**The script will:**
- Read `WISE_API_TOKEN` and `WISE_PROFILE_ID` from your `.env` file
- Check if you have a USD balance account
- Create one if needed
- Add **$1,000 in fake money**

**Example Output:**
```
🔍 Step 1: Checking existing balances...
🔓 Step 2: No USD balance found. Creating one now...
✅ USD Balance created successfully.
💰 Step 3: Adding $1,000 to balance 12345678 via simulation...
✅ SUCCESS! $1,000 fake USD added to your account.
```

**Need more funds?** Run the script again to add another $1,000.

---

#### **Step 5: Add Environment Variables to Vercel**

Go to [Vercel Dashboard](https://vercel.com/) → Your Project → **Settings** → **Environment Variables**

Add these four variables **in this exact order**:

| Variable | Value | Example |
|----------|-------|---------|
| `WISE_API_TOKEN` | Your API token from Step 2 | `a3921d54-3f27-4274-9a84-c7474bffe4d5` |
| `WISE_PROFILE_ID` | Your Profile ID from Step 3 script | `29379523` |
| `WISE_ENVIRONMENT` | `sandbox` for testing, `production` for live | `sandbox` |
| `WISE_SOURCE_CURRENCY` | Your currency | `USD` |

**Important:** These variables are ONLY needed in Vercel, NOT in Convex.

---

#### **Step 6: Configure Wise Webhook (Optional - For Production)**

**Note:** This step is optional and only needed in production. In development, you can use the `simulate-webhook.js` script to test.

**For Production:**

1. Go to Wise Dashboard → **Settings** → **Webhooks**
2. Click **Create Webhook**
3. Configure:

| Setting | Value |
|---------|-------|
| **Endpoint URL** | `https://your-app.vercel.app/api/webhooks/wise` |
| **Events** | ✅ `transfers#state-change` |
| **Description** | Affiliate Payout Status Updates |

4. Save and copy the webhook secret (if provided)

**What this does:** When a payout is completed, Wise will notify your app to update the payout status from "Processing" to "Completed".

---

### 🧪 Testing Locally

To test the payout flow locally without deploying:

1. Start your dev server: `npm run dev`
2. Request a payout in your app (you'll get a Transfer ID)
3. Simulate the webhook:
   ```bash
   node scripts/simulate-webhook.js YOUR_TRANSFER_ID
   ```

**Example:**
```bash
node scripts/simulate-webhook.js 123456789
```

This will mark the payout as completed in your local database.

---

### 📝 Complete .env Variables Checklist

After completing all steps, your `.env` file should have:

```env
# Wise Payout Integration (Sandbox) - ONLY if NEXT_PUBLIC_AFFILIATE_ENABLED=true
WISE_API_TOKEN=a3921d54-3f27-4274-9a84-c7474bffe4d5
WISE_PROFILE_ID=29379523
WISE_ENVIRONMENT=sandbox
WISE_SOURCE_CURRENCY=USD
```

**Vercel Environment Variables:**
- Same four variables as above

**Convex:**
- ❌ NO Wise variables needed in Convex

---

### 🔄 Switching from Sandbox to Production

When you're ready to use real money:

1. Create a **Wise Business Account** at [wise.com](https://wise.com/)
2. Complete business verification (required for API access)
3. Generate a **Production API Token** at [wise.com/settings/developer](https://wise.com/settings/developer)
4. Get your production Profile ID:
   - Add production token to `.env` temporarily
   - Run: `node scripts/get-wise-profile-id.js`
   - Copy the production Profile ID
5. Update Vercel variables:
   ```env
   WISE_API_TOKEN=prod_token_here
   WISE_PROFILE_ID=prod_profile_id_here
   WISE_ENVIRONMENT=production
   ```
6. Add real funds to your Wise account (no script needed - use Wise UI)
7. Configure the production webhook

**⚠️ Warning:** Production uses REAL money. Test thoroughly in Sandbox first!

---

### 🆘 Troubleshooting

**Error: "No profiles found for this API token"**
- Your token may be invalid. Generate a new one in Wise Sandbox settings.

**Error: "Failed to create balance"**
- Make sure you set your address to UK in Wise UI (Step 1)
- The script CANNOT change your address automatically

**Error: "Funding failed"**
- Make sure you're using Sandbox, not Production
- Verify your API token has "Full Access" permissions
- Ensure `WISE_PROFILE_ID` and `WISE_API_TOKEN` are both in `.env`

**Payout stuck in "Processing" (in local development)**
- Use `simulate-webhook.js` to manually complete it
- In production, wait for Wise webhook or check Wise dashboard

---

### 📚 Additional Resources

- **Scripts Documentation:** See [scripts/README.md](scripts/README.md) for detailed script usage
- **Wise API Docs:** [api-docs.wise.com](https://api-docs.wise.com/)
- **Affiliate Plan:** See [AFFILIATE_PLAN.md](AFFILIATE_PLAN.md) for the complete affiliate system design

---

## 🔐 Google OAuth Setup

### Step 1: Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth Client ID**
5. Choose **Web Application**

### Step 2: Configure Authorized URLs

**Authorized JavaScript Origins:**
- `http://localhost:3000` (for local dev)
- `https://your-app.vercel.app` (for production)

**Authorized Redirect URIs:**
- `http://localhost:3000/api/auth/callback/google` (for local dev)
- `https://your-app.vercel.app/api/auth/callback/google` (for production)

### Step 3: Copy Credentials

1. Copy **Client ID** and **Client Secret**
2. Add to both **Convex** and **Vercel** as:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

---

## ✅ Final Deployment Checklist

### Before Going Live

**Core Requirements:**
- [ ] All Convex environment variables are set (see Convex Configuration section)
- [ ] All core Vercel environment variables are set (see Vercel Configuration section)
- [ ] Authoritative Webhook is configured with `POLAR_WEBHOOK_SECRET` in Convex
- [ ] Google OAuth redirect URIs include production URL
- [ ] `NEXT_PUBLIC_POLAR_SANDBOX` is set correctly (`false` for production)

**Optional (if using):**
- [ ] Render backend is deployed (if using backend service)
- [ ] Wise variables are set in Vercel (if implementing affiliate payouts)
- [ ] `WISE_ENVIRONMENT` is set correctly (`production` for live, if using)

### Deploy Commands

1. **Deploy Convex Functions:**
   ```bash
   npx convex deploy
   ```

2. **Deploy Frontend (Vercel):**
   ```bash
   git push origin main
   ```
   (Vercel auto-deploys on push)

3. **Verify Deployment:**
   - Visit your Vercel URL
   - Sign up with a test account
   - Check Convex Dashboard for new user record
   - Test a payment (use Polar test mode)
   - Check affiliate dashboard (if enabled)

---

## 🎯 Quick Reference: All Webhooks

| Service | Endpoint URL | Events | Secret Name | Where to Add Secret |
|---------|-------------|--------|-------------|---------------------|
| **Authoritative Webhook** | `https://your-convex.convex.site/polar-webhook` | `order.created`<br>`order.paid`<br>`subscription.*` | `POLAR_WEBHOOK_SECRET` | Convex Dashboard |

**Note:** The Affiliate webhook is optional and only needed if `NEXT_PUBLIC_AFFILIATE_ENABLED=true`

---

## 🆘 Troubleshooting

**Issue: "Unauthorized" on Google Login**
- Ensure `BETTER_AUTH_URL` in Convex matches your production URL exactly
- Check Google OAuth redirect URIs include your production domain

**Issue: Payments not working**
- Verify Authoritative Webhook is pointing to your Convex `/polar-webhook` URL
- Check `POLAR_WEBHOOK_SECRET` is set in Convex Dashboard
- Ensure webhook events include `order.created`, `order.paid`, and `subscription.*`

**Issue: Affiliate commissions not tracking**
- Verify `NEXT_PUBLIC_AFFILIATE_ENABLED=true` in Vercel
- Check Authoritative Webhook is properly configured in Polar Dashboard
- Ensure you have linked the user via the `?ref=CODE` link first

**Issue: Payouts not working**
- Verify `WISE_API_TOKEN` and `WISE_PROFILE_ID` are set in Vercel
- Check `WISE_ENVIRONMENT` matches your setup (`sandbox` or `production`)
- Ensure affiliate has valid payout method configured

---

**You're all set! 🚀**
