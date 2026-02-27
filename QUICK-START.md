# Quick Start - Get Running in 10 Minutes

**Phase 3 is DONE. Here's how to test it:**

---

## 1. Get API Keys (5 min)

### Clerk (Auth)
1. Go to https://dashboard.clerk.com/sign-up
2. Create app → Choose "Email + Password"
3. Copy keys:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### Supabase (Database)
1. Go to https://app.supabase.com/sign-up
2. New Project → Name it "ai-agency-portal"
3. Copy keys from Settings → API:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

---

## 2. Configure Environment (1 min)

Edit `.env.local` and paste your keys:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# OpenRouter (already set)
OPENROUTER_API_KEY=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
```

---

## 3. Set Up Database (2 min)

1. In Supabase: **SQL Editor** → **New Query**
2. Copy/paste `supabase-schema.sql`
3. Click **Run**
4. Should see: "Success. No rows returned"

---

## 4. Start the App (1 min)

```bash
cd ~/.openclaw/workspace/projects/ai-agency-portal
npm run dev
```

Open: http://localhost:3000

---

## 5. Test It (1 min)

1. **Sign up** → Create account
2. **Start chat** → Click "Continue Setup"
3. **Talk to agent:** "My company is Acme Corp, website acme.com, we're in SaaS"
4. **Close browser**
5. **Reopen** → Messages should reload! ✨

---

## Verify Data Saved

In Supabase SQL Editor:

```sql
-- See your client record
SELECT * FROM clients;

-- See saved messages
SELECT * FROM chat_messages ORDER BY created_at DESC;

-- See extracted profile data
SELECT brand_data FROM client_profiles;
```

---

## If Something Breaks

Check:
- Server console (terminal running `npm run dev`)
- Browser console (F12)
- Supabase logs (Dashboard → Logs)

Or see `SETUP.md` for detailed troubleshooting.

---

## What Works Now

✅ Sign up / Sign in  
✅ Conversational onboarding  
✅ AI agent extracts data automatically  
✅ Messages persist across sessions  
✅ Profile completion tracking  
✅ "Welcome back" continuity  

---

## What's Next

- **Phase 4:** Hook up dashboards with real data
- **Phase 5:** Feedback submission flow
- **Phase 6:** Polish & deploy to Vercel

---

**Need help? Check SETUP.md or PHASE3-COMPLETION.md for details.**
