# AI Agency Client Portal - Build Plan
*Conversational onboarding portal with training dashboard*

**Goal:** Self-service onboarding portal where clients build their AI agent through conversation, not forms.

**Tech Stack:**
- Next.js 14 (App Router)
- Clerk (auth)
- Supabase (database + realtime)
- Vercel AI SDK (conversational agent)
- shadcn/ui + 21st.dev (components)
- Tailwind CSS

**Location:** `~/.openclaw/workspace/projects/ai-agency-portal`

---

## Phase 1: Foundation & Infrastructure
*Goal: Get the skeleton up — auth, database, basic routing*

### 1.1 Project Setup
- [ ] Initialize Next.js 14 app (`npx create-next-app@latest`)
- [ ] Configure Tailwind CSS
- [ ] Install shadcn/ui (`npx shadcn-ui@latest init`)
- [ ] Set up project structure:
  ```
  app/
  ├── (auth)/
  │   ├── sign-in/
  │   └── sign-up/
  ├── (dashboard)/
  │   ├── onboarding/
  │   ├── training/
  │   └── settings/
  ├── api/
  │   ├── chat/
  │   └── client/
  └── layout.tsx
  ```
- [ ] Install dependencies:
  - `@clerk/nextjs`
  - `@supabase/supabase-js`
  - `ai` (Vercel AI SDK)
  - `zod` (validation)
  - `date-fns` (date handling)

### 1.2 Authentication (Clerk)
- [ ] Create Clerk application
- [ ] Add API keys to `.env.local`
- [ ] Wrap app in `<ClerkProvider>`
- [ ] Create auth middleware for protected routes
- [ ] Build sign-in/sign-up pages (use Clerk components)
- [ ] Test: Sign up → Dashboard redirect

### 1.3 Database Schema (Supabase)
- [ ] Create Supabase project
- [ ] Design schema:
  ```sql
  -- clients table
  id uuid PRIMARY KEY
  clerk_user_id text UNIQUE
  company_name text
  email text
  tier text (starter/pro/enterprise)
  created_at timestamp
  
  -- client_profiles table (onboarding data)
  id uuid PRIMARY KEY
  client_id uuid REFERENCES clients
  brand_data jsonb (logo, colors, website)
  business_context jsonb (products, faqs, policies)
  voice_personality jsonb (tone, examples)
  onboarding_stage text (brand/context/voice/review/complete)
  completed_at timestamp
  
  -- chat_messages table (conversation history)
  id uuid PRIMARY KEY
  client_id uuid REFERENCES clients
  role text (user/assistant/system)
  content text
  metadata jsonb (step, suggestions, auto_saved_fields)
  created_at timestamp
  
  -- training_conversations table
  id uuid PRIMARY KEY
  client_id uuid REFERENCES clients
  conversation_data jsonb
  flagged boolean
  feedback text
  status text (pending/reviewed/fixed)
  created_at timestamp
  ```
- [ ] Run migrations
- [ ] Set up RLS policies (row-level security)
- [ ] Test: Insert test client record

### 1.4 Basic UI Shell
- [ ] Create dashboard layout with sidebar:
  - Onboarding (main)
  - Training (locked until onboarding complete)
  - Settings
- [ ] Add user dropdown (Clerk `<UserButton>`)
- [ ] Create empty page components for each route
- [ ] Test: Navigate between pages

**Phase 1 Checkpoint:** Auth works, database schema ready, basic routing functional

---

## Phase 2: Conversational Onboarding Agent (THE KEY FEATURE)
*Goal: Build the chat interface that replaces static forms*

### 2.1 Chat UI Components
- [ ] Install/configure shadcn chat components or build custom:
  - `ChatMessage` (user/assistant bubbles)
  - `ChatInput` (text input with send button)
  - `ChatContainer` (scrollable message list)
  - `TypingIndicator`
- [ ] Add 21st.dev component for wow factor (animated gradient border on chat container)
- [ ] Make it beautiful:
  - Smooth animations (framer-motion)
  - Auto-scroll to bottom on new message
  - Timestamp on messages
  - "Agent is typing..." indicator

### 2.2 Agent Brain (Vercel AI SDK + OpenRouter)
- [ ] Create `/api/chat` route (POST)
- [ ] Set up Vercel AI SDK with OpenRouter:
  ```typescript
  import { OpenAIStream, StreamingTextResponse } from 'ai'
  
  // Use OpenRouter with Claude Sonnet
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [...],
      stream: true,
    }),
  })
  ```
- [ ] Load client profile + chat history from Supabase
- [ ] Build agent system prompt:
  ```
  You are an onboarding specialist helping [Company Name] set up their AI agent.
  
  Current stage: [brand/context/voice/review]
  Already collected: [list of completed fields]
  
  Your goal: Guide them through [current stage] conversationally.
  - Ask ONE question at a time
  - Keep it friendly and casual
  - Auto-save their answers to their profile
  - Suggest smart follow-ups based on their industry
  - Show progress: "Great! We've covered X, Y. Next up: Z"
  ```
- [ ] Implement conversation flow logic:
  - Track onboarding stage (brand → context → voice → review)
  - Auto-detect when stage is complete
  - Transition to next stage
- [ ] Test: Chat with agent, verify responses make sense

### 2.3 Auto-Save Profile Data
- [ ] Build field extraction logic (parse agent responses for structured data)
- [ ] Use function calling (OpenRouter supports it):
  ```typescript
  functions: [
    {
      name: 'save_brand_info',
      parameters: {
        company_name: 'string',
        website: 'string',
        industry: 'string',
      }
    },
    {
      name: 'save_product',
      parameters: {
        name: 'string',
        description: 'string',
        price: 'number',
      }
    },
    // etc.
  ]
  ```
- [ ] On function call → save to Supabase `client_profiles` table
- [ ] Send confirmation back to user: "✓ Saved to your profile"
- [ ] Test: Verify data persists between sessions

### 2.4 Memory & Context
- [ ] Load last 20 messages from `chat_messages` on page load
- [ ] Show "picking up where you left off" message if returning user
- [ ] Display progress indicator:
  ```
  ┌─────────────────────────────────────────┐
  │ Your Progress                           │
  │ ✓ Brand & Basics                        │
  │ → Business Context (50% complete)       │
  │   • Products: Done                      │
  │   • FAQs: In progress                   │
  │   • Policies: Not started               │
  │ ⏳ Voice & Personality                  │
  │ ⏳ Review & Launch                       │
  └─────────────────────────────────────────┘
  ```
- [ ] Calculate completion percentage dynamically
- [ ] Test: Close browser, reopen, verify continuity

### 2.5 Smart Suggestions
- [ ] Agent suggests what they might need based on answers:
  - "Since you're in e-commerce, your agent should handle: order tracking, returns, product questions. Sound good?"
- [ ] Pre-fill common answers (if they say "software company", auto-suggest common policies)
- [ ] Offer to scrape their website: "Want me to grab your product list from your site? I can save you typing."
- [ ] Test: Verify suggestions are contextually relevant

**Phase 2 Checkpoint:** Conversational onboarding works end-to-end, data persists, memory functional

---

## Phase 3: Dashboards & Views
*Goal: Training dashboard, client dashboard, review flow*

### 3.1 Client Dashboard (Post-Onboarding)
- [ ] Create `/dashboard` home page
- [ ] Show agent status card:
  - Training (Day X of 30)
  - Live
  - Paused
- [ ] Display quick stats:
  - Conversations handled this week
  - Resolution rate
  - Avg response time
- [ ] Recent activity feed
- [ ] Action buttons:
  - View Conversations
  - Submit Feedback
  - Update Info
- [ ] Use 21st.dev cards for visual appeal

### 3.2 Training Dashboard
- [ ] Create `/training` page
- [ ] Progress bar (Day X of 30, Y% complete)
- [ ] Recent conversations list:
  ```
  ┌──────────────────────────────────────┐
  │ • Customer asked about refund        │
  │   Agent: [response preview]          │
  │   [View Full] [Flag Issue]           │
  ├──────────────────────────────────────┤
  │ • Product question                   │
  │   Agent: [response]                  │
  │   [View Full] [Flag Issue]           │
  └──────────────────────────────────────┘
  ```
- [ ] Metrics cards:
  - Accuracy: X% (target: 90%)
  - Escalation rate: X%
  - Avg response time
- [ ] Load from `training_conversations` table
- [ ] Test: Display mock conversations

### 3.3 Review Flow (Onboarding Complete)
- [ ] Build `/onboarding/review` page
- [ ] Display summary of all collected data:
  - Brand & Basics
  - Business Context (products, FAQs, policies)
  - Voice & Personality
- [ ] Show AI-generated sample conversation preview
- [ ] Edit buttons for each section (opens chat to update that section)
- [ ] "Approve & Start Training" button
  - Updates `onboarding_stage` to 'complete'
  - Triggers agent build (we'll mock this initially)
  - Redirects to Training dashboard
- [ ] Test: Complete onboarding → see review page

**Phase 3 Checkpoint:** All dashboards functional, navigation works, data displays correctly

---

## Phase 4: Feedback & Refinement
*Goal: Feedback submission, flag issues, improvements*

### 4.1 Feedback Submission Flow
- [ ] Create "Flag Issue" modal on training dashboard:
  - Shows the conversation
  - Input: "What should the agent have said?"
  - Submit button
- [ ] Save to `training_conversations` table:
  - `flagged: true`
  - `feedback: user_input`
  - `status: 'pending'`
- [ ] Show success toast: "Feedback submitted! We'll review and improve."
- [ ] Test: Flag conversation → verify in database

### 4.2 Feedback Dashboard (Internal/Future)
- [ ] Create `/admin/feedback` (staff only, maybe later)
- [ ] List all flagged conversations
- [ ] Mark as reviewed/fixed
- [ ] (Optional) Auto-update agent training data

### 4.3 Update Info Flow
- [ ] Create `/settings/update` page
- [ ] Let client edit:
  - Product info
  - FAQ answers
  - Policies
  - Team members
- [ ] Use forms (not chat) for this — faster
- [ ] Save updates → trigger agent context refresh (mock for now)
- [ ] Test: Update product → see changes reflected

**Phase 4 Checkpoint:** Feedback loop functional, clients can update info

---

## Phase 5: Polish & Deploy
*Goal: Production-ready, deployed to Vercel*

### 5.1 UI Polish
- [ ] Add loading states everywhere (Skeleton components from shadcn)
- [ ] Error handling (try/catch, error boundaries)
- [ ] Empty states:
  - "No conversations yet"
  - "No feedback submitted"
- [ ] Responsive design (mobile-friendly)
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Add micro-animations (framer-motion):
  - Message fade-in
  - Progress bar fill
  - Button hover states

### 5.2 Performance Optimization
- [ ] Enable Next.js image optimization
- [ ] Add caching for Supabase queries
- [ ] Lazy load heavy components
- [ ] Bundle size check (`npm run build` — keep under 300KB initial)
- [ ] Lighthouse audit (aim for 90+ on all metrics)

### 5.3 Security & Validation
- [ ] Input validation with Zod on all API routes
- [ ] Rate limiting on `/api/chat` (prevent abuse)
- [ ] Sanitize user input (prevent XSS)
- [ ] Verify Clerk webhooks (signature validation)
- [ ] Environment variables check (fail fast if missing)

### 5.4 Documentation
- [ ] Create `README.md` with:
  - Setup instructions
  - Environment variables needed
  - Local development guide
  - Deployment steps
- [ ] Add inline code comments for complex logic
- [ ] Document API routes (inputs, outputs, errors)

### 5.5 Deployment
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Add environment variables in Vercel dashboard:
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `OPENROUTER_API_KEY`
- [ ] Deploy to production
- [ ] Test production deployment:
  - Sign up flow
  - Chat agent
  - Dashboard views
- [ ] Add custom domain (if ready)
- [ ] Monitor logs for errors (Vercel dashboard)

**Phase 5 Checkpoint:** App live, production-ready, documented

---

## Testing Strategy

### Unit Tests (Optional, but recommended)
- [ ] Test utility functions (profile parsing, data extraction)
- [ ] Test API routes (mock Supabase calls)
- [ ] Use Vitest or Jest

### Integration Tests
- [ ] Test full onboarding flow (Playwright)
- [ ] Test chat → save → reload
- [ ] Test review → approve → redirect

### Manual Testing Checklist
- [ ] Sign up → Dashboard
- [ ] Onboarding chat (complete all stages)
- [ ] Review page → Approve
- [ ] Training dashboard loads
- [ ] Flag conversation → Feedback saved
- [ ] Update settings → Changes persist
- [ ] Logout → Login → Session restored

---

## Success Metrics

**MVP Definition (Done when):**
- [x] User can sign up and authenticate
- [x] Conversational onboarding agent guides through 4 stages
- [x] Profile data auto-saves during conversation
- [x] User can review and approve their setup
- [x] Training dashboard shows progress and conversations
- [x] User can flag issues and submit feedback
- [x] Deployed to production and accessible

**Nice-to-Haves (Post-MVP):**
- [ ] Website scraping (auto-fill products/FAQs)
- [ ] Voice tone previews (AI generates sample responses)
- [ ] Admin dashboard (internal team view)
- [ ] Email notifications (onboarding complete, agent ready)
- [ ] Analytics (Posthog integration)
- [ ] Mobile app (React Native or PWA)

---

## Timeline Estimate

| Phase | Estimated Time |
|-------|----------------|
| Phase 1: Foundation | 1-2 days |
| Phase 2: Conversational Agent | 3-4 days |
| Phase 3: Dashboards | 2-3 days |
| Phase 4: Feedback | 1-2 days |
| Phase 5: Polish & Deploy | 2-3 days |
| **Total** | **9-14 days** |

*Assumes full-time focus, no blockers*

---

## Risk Areas & Mitigation

**Risk:** Conversational agent doesn't extract data reliably
- **Mitigation:** Use function calling (structured output), fallback to explicit "save buttons"

**Risk:** Chat context gets too long (token limit)
- **Mitigation:** Summarize old messages, keep last 20 only

**Risk:** OpenRouter rate limits
- **Mitigation:** Add client-side debounce, queue messages

**Risk:** Supabase RLS misconfiguration (data leak)
- **Mitigation:** Test RLS policies thoroughly, use `clerk_user_id` for isolation

**Risk:** Deployment issues (env vars, CORS)
- **Mitigation:** Test in Vercel preview environment first

---

## Notes

- **21st.dev components:** Use sparingly for hero sections (chat container, progress cards). Don't over-animate.
- **Mobile-first:** Design for mobile, scale up to desktop.
- **Clerk vs NextAuth:** Clerk is faster to set up, better UX out of the box. Go with Clerk.
- **Vercel AI SDK:** Handles streaming, edge functions, retries. Perfect for this.
- **Supabase Realtime:** Could use for live training dashboard updates (future enhancement).

---

## Ready to Build

**Next Step:** Start Phase 1 — Initialize project and set up foundation.

**Questions for Preston/Zora before starting:**
1. OpenRouter API key ready?
2. Preferred Clerk plan (free tier OK for MVP)?
3. Custom domain ready or use Vercel subdomain?
4. Any brand colors/logo to use for portal UI?

---

*Plan complete. Ready to execute.* 💻
