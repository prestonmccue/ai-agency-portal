-- AI Agency Portal Database Schema

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  brand_data JSONB DEFAULT '{}',
  business_context JSONB DEFAULT '{}',
  voice_personality JSONB DEFAULT '{}',
  onboarding_stage TEXT DEFAULT 'brand' CHECK (onboarding_stage IN ('brand', 'context', 'voice', 'review', 'complete')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training conversations table (for review/flagging)
CREATE TABLE IF NOT EXISTS training_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  conversation_data JSONB DEFAULT '{}',
  flagged BOOLEAN DEFAULT FALSE,
  feedback TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'fixed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_clerk_user_id ON clients(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_client_id ON chat_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now, tighten later)
CREATE POLICY "Allow all" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all" ON client_profiles FOR ALL USING (true);
CREATE POLICY "Allow all" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Allow all" ON training_conversations FOR ALL USING (true);
