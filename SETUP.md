# Setup Guide - AI Agency Portal

**Phase 3 (Data Integration) is complete!** This guide will help you get everything running.

## Prerequisites

You need accounts and API keys for:
1. **Clerk** (authentication) - Free tier: dashboard.clerk.com
2. **Supabase** (database) - Free tier: app.supabase.com  
3. **OpenRouter** (AI) - Already have: `sk-or-v1-...e940ab3` (from TOOLS.md)

---

## Step 1: Install Dependencies

```bash
cd ~/.openclaw/workspace/projects/ai-agency-portal
npm install
```

---

## Step 2: Set Up Clerk (Authentication)

1. Go to https://dashboard.clerk.com
2. Create a new application
3. Choose authentication methods:
   - ✅ Email + Password
   - ✅ Google OAuth (optional)
4. Copy your API keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)

5. Add these to `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## Step 3: Set Up Supabase (Database)

### 3.1 Create Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose:
   - **Name:** ai-agency-portal
   - **Database Password:** (save this securely!)
   - **Region:** Closest to you
4. Wait 2-3 minutes for setup

### 3.2 Get API Keys
1. Go to **Settings → API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

3. Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### 3.3 Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy/paste contents of `supabase-schema.sql`
4. Click **Run**
5. You should see: "Success. No rows returned"

### 3.4 Verify Tables Created
Run this query to check:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'client_profiles', 'chat_messages', 'training_conversations');
```

Should return 4 rows.

---

## Step 4: Configure Environment Variables

Your `.env.local` should now look like this:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# OpenRouter (from TOOLS.md)
OPENROUTER_API_KEY=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

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 5: Run the App

```bash
npm run dev
```

Open http://localhost:3000

---

## Testing Checklist

### ✅ Test 1: Sign Up Flow
1. Click "Get Started"
2. Sign up with email/password
3. Should redirect to `/dashboard`
4. Check Supabase:
   ```sql
   SELECT * FROM clients;
   ```
   Should see your user record!

### ✅ Test 2: Start Onboarding Chat
1. From dashboard, click "Continue Setup"
2. Should see `/onboarding` page
3. Chat should load (may be empty for new user)
4. Type: "My company is Acme Corp"
5. Agent should respond and save data
6. Check Supabase:
   ```sql
   SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10;
   ```
   Should see your message + agent's response!

### ✅ Test 3: Data Persistence
1. Answer a few questions (company name, website, industry)
2. Close the browser tab
3. Reopen http://localhost:3000/onboarding
4. Should see:
   - "Welcome back!" banner
   - Previous messages loaded
   - Progress bar showing your completion %

### ✅ Test 4: Function Calling (Data Extraction)
1. In chat, say: "My company is Acme Corp, website is acme.com, we're in e-commerce"
2. Agent should call `save_brand_info()` function
3. Check Supabase:
   ```sql
   SELECT brand_data FROM client_profiles;
   ```
   Should see JSON with your company data!

### ✅ Test 5: Profile Completion Tracking
1. Complete more of the onboarding (products, FAQs, etc.)
2. Watch the progress bar increase
3. Check the stage indicators update (Brand → Context → Voice → Review)

---

## Troubleshooting

### Error: "Unauthorized" on chat
- **Fix:** Check Clerk keys in `.env.local`
- Run: `npm run dev` to restart server

### Error: "Supabase connection failed"
- **Fix:** Verify Supabase URL and keys
- Make sure schema was run successfully
- Check RLS policies are enabled

### Error: "OpenRouter rate limit"
- **Fix:** Wait a few seconds between messages
- Check API key is valid: https://openrouter.ai/keys

### Messages not saving
- **Fix:** Check Supabase RLS policies
- Verify `clerk_user_id` matches between Clerk and Supabase
- Look at Network tab in browser dev tools for errors

### Function calls not working
- **Fix:** Check OpenRouter model supports function calling (Claude Sonnet does)
- Look at server console logs: `[Function Call] save_brand_info: {...}`
- Verify Supabase tables have correct structure

---

## What's Next?

Phase 3 is **complete**! Here's what still needs to be done:

### Phase 4: Dashboards (Hook up real data)
- [ ] Client dashboard - Show actual stats from database
- [ ] Training dashboard - Display real conversations
- [ ] Settings page - Save updates to database

### Phase 5: Feedback Flow
- [ ] Flag conversation feature
- [ ] Feedback submission
- [ ] Review dashboard (internal)

### Phase 6: Polish & Deploy
- [ ] Error handling everywhere
- [ ] Loading states
- [ ] Mobile responsive tweaks
- [ ] Deploy to Vercel
- [ ] Custom domain

---

## Architecture Overview

```
User signs up via Clerk
  ↓
Client record auto-created in Supabase
  ↓
Client starts chat on /onboarding
  ↓
Messages sent to /api/chat
  ↓
OpenRouter (Claude Sonnet) processes with function calling
  ↓
Functions extract data → save to Supabase
  ↓
Messages saved to chat_messages table
  ↓
On page refresh → load history from database
  ↓
Progress bar updates based on profile completion %
```

---

## Key Files

- **`lib/db-helpers.ts`** - All database operations
- **`lib/supabase.ts`** - Supabase client & TypeScript types
- **`app/api/chat/route.ts`** - Main chat API with function calling
- **`app/api/chat/history/route.ts`** - Load chat history
- **`components/chat-interface.tsx`** - Chat UI component
- **`supabase-schema.sql`** - Database schema
- **`.env.local`** - Environment variables (not in git!)

---

## Cost Breakdown (once live)

- **Clerk:** Free (up to 10k monthly active users)
- **Supabase:** Free (500MB DB, 2GB bandwidth)
- **OpenRouter (Claude Sonnet):** ~$0.003 per message
- **Vercel:** Free (hobby plan)

**Estimate:** 100 clients × 50 messages = **$15/month in AI costs**

---

## Support

If you hit issues:
1. Check server console logs: `npm run dev` output
2. Check browser console: F12 → Console tab
3. Check Supabase logs: Dashboard → Logs
4. Review this guide step-by-step

---

**Built with focus. Ready to ship.** 💻
