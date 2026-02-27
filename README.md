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
- [x] Progress indicator
- [ ] Auto-save to Supabase (function calling - TODO)
- [ ] Memory/context loading (TODO)

### Phase 3: Dashboards ✅
- [x] Client dashboard
- [x] Training dashboard (UI only, mock data)
- [x] Settings page
- [ ] Real data integration (TODO)

### Phase 4: Feedback (TODO)
- [ ] Flag conversation feature
- [ ] Feedback submission flow
- [ ] Update info functionality

### Phase 5: Deploy (TODO)
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

Run this SQL in your Supabase SQL editor:

```sql
-- clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- client_profiles table
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  brand_data JSONB DEFAULT '{}',
  business_context JSONB DEFAULT '{}',
  voice_personality JSONB DEFAULT '{}',
  onboarding_stage TEXT CHECK (onboarding_stage IN ('brand', 'context', 'voice', 'review', 'complete')) DEFAULT 'brand',
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(client_id)
);

-- chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- training_conversations table
CREATE TABLE training_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  conversation_data JSONB DEFAULT '{}',
  flagged BOOLEAN DEFAULT FALSE,
  feedback TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'fixed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own client data" ON clients
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view own profile" ON client_profiles
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can view own messages" ON chat_messages
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can view own training data" ON training_conversations
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'));
```

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
