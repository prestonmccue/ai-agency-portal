# Phase 3 Test Plan - Data Integration

**Use this checklist to verify Phase 3 is working correctly.**

---

## Pre-Flight Checklist

- [ ] `.env.local` has all required keys
- [ ] `supabase-schema.sql` has been run in Supabase
- [ ] Dev server is running: `npm run dev`
- [ ] Can access http://localhost:3000

---

## Test 1: Client Record Creation

**Goal:** Verify auto-creation of client record on signup

### Steps:
1. Go to http://localhost:3000
2. Click "Get Started"
3. Sign up with: test@example.com / password123
4. Should redirect to `/dashboard`

### Verify in Supabase:
```sql
SELECT * FROM clients ORDER BY created_at DESC LIMIT 1;
```

**Expected:**
- ✅ One row returned
- ✅ `clerk_user_id` matches your Clerk user ID
- ✅ `email` is test@example.com
- ✅ `tier` is 'starter'
- ✅ `created_at` is recent

---

## Test 2: Chat Message Persistence

**Goal:** Verify messages save to database

### Steps:
1. From dashboard, click "Continue Setup"
2. In chat, type: "Hello, I'm testing the portal"
3. Wait for agent response

### Verify in Supabase:
```sql
SELECT role, content, created_at 
FROM chat_messages 
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected:**
- ✅ Two rows: one 'user', one 'assistant'
- ✅ User message content: "Hello, I'm testing the portal"
- ✅ Assistant message has a response
- ✅ Timestamps are recent
- ✅ Both have same `client_id`

---

## Test 3: Function Calling (Data Extraction)

**Goal:** Verify AI extracts and saves structured data

### Steps:
1. In chat, say: "My company is Acme Corp, website is acme.com, we're in e-commerce"
2. Agent should respond with confirmation
3. Look for "✓ Saved to your profile" in response

### Verify in Supabase:
```sql
SELECT brand_data FROM client_profiles;
```

**Expected:**
- ✅ JSON contains: `"company_name": "Acme Corp"`
- ✅ JSON contains: `"website": "acme.com"`
- ✅ JSON contains: `"industry": "e-commerce"`

### Server Console Check:
Should see log line like:
```
[Function Call] save_brand_info: { company_name: 'Acme Corp', website: 'acme.com', industry: 'e-commerce' }
```

---

## Test 4: Chat History Loading

**Goal:** Verify continuity across sessions

### Steps:
1. While in chat, note the current message count
2. **Close the browser tab completely**
3. Open http://localhost:3000/onboarding again
4. Should see:
   - "Welcome back!" banner
   - All previous messages loaded
   - Can continue conversation

### Verify in Browser:
- ✅ Blue banner: "Welcome back! Picking up where we left off"
- ✅ Messages appear in correct order
- ✅ Both user and assistant messages visible

---

## Test 5: Profile Completion Tracking

**Goal:** Verify progress bar updates dynamically

### Steps:
1. Check current progress bar percentage (top of page)
2. Continue answering questions:
   - Products: "We sell cloud hosting subscriptions"
   - FAQs: "How do I cancel? Contact support@acme.com"
   - Tone: "We want friendly and professional tone"
3. Refresh the page
4. Progress bar should have increased

### Verify in Supabase:
```sql
SELECT 
  onboarding_stage,
  brand_data ? 'company_name' as has_company,
  business_context ? 'products' as has_products,
  voice_personality ? 'tone' as has_tone
FROM client_profiles;
```

**Expected:**
- ✅ Progress bar shows higher % after adding data
- ✅ Stage has advanced (e.g., 'brand' → 'context')
- ✅ Database shows collected fields

---

## Test 6: Stage Advancement

**Goal:** Verify onboarding progresses through stages

### Initial Check:
```sql
SELECT onboarding_stage FROM client_profiles;
```
Should be: `'brand'`

### Steps:
1. Complete brand questions (company, website, industry)
2. Agent should say something like: "Perfect! Moving to business context..."
3. Check database again

**Expected:**
- ✅ `onboarding_stage` has changed to `'context'`
- ✅ UI shows "Business Context" as current step
- ✅ Progress indicator updated

---

## Test 7: Error Handling

**Goal:** Verify graceful failures

### Test 7a: Network Error
1. Stop dev server (`Ctrl+C`)
2. Try sending a message
3. Should see error: "❌ Sorry, something went wrong. Please try again."

### Test 7b: Invalid Input
1. Restart dev server
2. Send empty message (just spaces)
3. Send button should be disabled

---

## Test 8: RLS Policies (Security)

**Goal:** Verify users can only see their own data

### Steps:
1. Sign up with second account: test2@example.com
2. Start chat as this new user
3. Send a message

### Verify in Supabase:
```sql
-- Should return 2 clients
SELECT clerk_user_id, email FROM clients;

-- Check messages are isolated
SELECT c.email, COUNT(m.id) as message_count
FROM clients c
LEFT JOIN chat_messages m ON m.client_id = c.id
GROUP BY c.email;
```

**Expected:**
- ✅ Both users have separate message counts
- ✅ In app, user 1 can't see user 2's messages
- ✅ In app, user 2 can't see user 1's messages

---

## Test 9: Multiple Function Calls

**Goal:** Verify agent can call multiple functions in sequence

### Steps:
1. Say: "We sell three products: Basic ($10/mo), Pro ($50/mo), and Enterprise ($200/mo)"
2. Agent should extract all three products

### Verify in Supabase:
```sql
SELECT business_context->'products' FROM client_profiles;
```

**Expected:**
- ✅ JSON array with 3 product objects
- ✅ Each has name, description, price

---

## Test 10: Profile Completion Calculation

**Goal:** Verify completion % is accurate

### Steps:
1. Start fresh account or reset profile
2. Note starting %: should be 0% or low
3. Add data step by step:
   - Company name → check %
   - Website → check %
   - Products → check %
   - FAQs → check %

### Calculate Manually:
- Total fields: 12
- Brand: 5 fields (company, website, industry, colors, logo)
- Context: 3 sections (products, faqs, policies)
- Voice: 4 fields (tone, examples, greeting, signoff)

**Expected:**
- ✅ Each field increases % by ~8% (100/12)
- ✅ UI progress bar matches calculation
- ✅ 100% when all fields complete

---

## Automated Test Script (Optional)

Run this in Supabase SQL Editor after completing tests:

```sql
-- Summary of test results
SELECT 
  'Clients Created' as metric,
  COUNT(*) as value
FROM clients
UNION ALL
SELECT 
  'Messages Sent' as metric,
  COUNT(*) as value
FROM chat_messages
UNION ALL
SELECT 
  'Profiles Created' as metric,
  COUNT(*) as value
FROM client_profiles
UNION ALL
SELECT 
  'Avg Completion %' as metric,
  AVG(
    (CASE WHEN brand_data ? 'company_name' THEN 1 ELSE 0 END +
     CASE WHEN brand_data ? 'website' THEN 1 ELSE 0 END +
     CASE WHEN business_context ? 'products' THEN 1 ELSE 0 END) * 100 / 3
  )::int as value
FROM client_profiles;
```

---

## Success Criteria

**Phase 3 passes if:**
- [x] All 10 tests pass
- [x] No errors in server console
- [x] No errors in browser console
- [x] Data persists across sessions
- [x] Function calling extracts data correctly
- [x] Progress tracking updates dynamically

---

## Common Issues

### "Unauthorized" error on chat
**Fix:** Check Clerk keys in `.env.local`

### Messages not saving
**Fix:** Verify RLS policies are enabled in Supabase

### Function calls not working
**Fix:** Check server console for `[Function Call]` logs

### History not loading
**Fix:** Check `/api/chat/history` endpoint in Network tab

---

## Cleanup (After Testing)

To reset for fresh test:

```sql
-- Delete all test data
DELETE FROM chat_messages;
DELETE FROM client_profiles;
DELETE FROM clients;

-- Verify empty
SELECT COUNT(*) FROM clients;
```

---

**All tests passed? Phase 3 is bulletproof. Ship it. 🚀**
