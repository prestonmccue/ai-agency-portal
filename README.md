# AI Agency Client Portal

A conversational onboarding portal for AI agency clients. Instead of boring static forms, clients chat with an AI agent that guides them through setup, auto-saves their responses, and remembers where they left off.

## Features

### Phase 1: Foundation ✅
- [x] Next.js 14 app with TypeScript
- [x] Clerk authentication
- [x] Supabase database setup (schema defined)
- [x] Dashboard layout with sidebar
- [x] Basic routing and navigation

### Phase 2: Conversational Agent ✅
- [x] Chat interface (powered by Vercel AI SDK)
- [x] OpenRouter integration (Claude Sonnet)
- [x] Real-time streaming responses
- [x] Conversational onboarding flow
- [x] Progress indicator (dynamic, based on actual stage)
- [x] Auto-save to Supabase (function calling implemented!)
- [x] Memory/context loading (chat history persists!)

### Phase 3: Data Integration ✅
- [x] Supabase client configuration
- [x] Database helper functions (create, read, update)
- [x] Function calling in chat API (6 functions for data extraction)
- [x] Chat message persistence (every message saved)
- [x] Chat history loading on page refresh
- [x] Client record auto-creation on first message
- [x] Profile completion percentage calculation
- [x] Dynamic progress tracking in UI
- [x] "Pick up where you left off" feature

### Phase 4: Dashboards
- [x] Client dashboard (UI complete)
- [x] Training dashboard (UI only, mock data - needs real data)
- [x] Settings page (UI complete)
- [ ] Real data integration for dashboards (TODO)

### Phase 5: Feedback (TODO)
- [ ] Flag conversation feature
- [ ] Feedback submission flow
- [ ] Update info functionality

### Phase 6: Deploy (TODO)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** Clerk
- **Database:** Supabase
- **AI:** Vercel AI SDK + OpenRouter (Claude 3.5 Sonnet)
- **UI:** Tailwind CSS, shadcn/ui, Lucide icons
- **Deployment:** Vercel (planned)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Clerk account (free tier OK)
- Supabase account (free tier OK)
- OpenRouter API key

### Installation

1. Clone and install dependencies:
```bash
cd ai-agency-portal
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your keys:

```env
# Clerk (get from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase (get from app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# OpenRouter (get from openrouter.ai)
OPENROUTER_API_KEY=sk-or-v1-xxx
```

3. Set up Supabase database:

Run the schema file in your Supabase SQL editor:

```bash
# The complete schema is in supabase-schema.sql
# Copy and paste the contents into: Supabase Dashboard → SQL Editor → New Query
```

Or manually run the SQL from `supabase-schema.sql` (includes tables, indexes, RLS policies, and helper functions)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. Click "Get Started" and sign up with Clerk
2. You'll be redirected to the dashboard
3. Click "Continue Setup" to start the conversational onboarding
4. Chat with the AI agent to configure your AI team member!

## Project Structure

```
ai-agency-portal/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── onboarding/      # Conversational onboarding
│   │   ├── training/        # Training dashboard
│   │   └── settings/        # Settings page
│   ├── api/
│   │   └── chat/            # Chat API (OpenRouter)
│   ├── layout.tsx           # Root layout (Clerk provider)
│   └── globals.css          # Global styles
├── components/
│   └── chat-interface.tsx   # Chat UI component
├── lib/
│   ├── utils.ts             # Utility functions
│   └── supabase.ts          # Supabase client & types
├── tasks/
│   └── todo.md              # Build plan & progress
└── middleware.ts            # Clerk auth middleware
```

## Next Steps

See `tasks/todo.md` for the full build plan and what's left to implement:

**Priority TODOs:**
1. Implement function calling in chat API to auto-save data to Supabase
2. Load chat history and profile data for context/memory
3. Make progress indicator dynamic based on actual stage
4. Add real data to training dashboard
5. Implement feedback submission flow
6. Add error handling and loading states
7. Deploy to Vercel

## Development Notes

- The chat interface uses Vercel AI SDK's `useChat` hook for streaming
- OpenRouter proxies to Claude 3.5 Sonnet (can easily swap models)
- Supabase RLS policies ensure users only see their own data
- The conversational agent is the hero feature - focus on making it feel natural!

## Questions?

Check the main spec at `reference/client-portal-spec.md` for the full vision.

---

**Built by Cody 💻**
