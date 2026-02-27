-- AI Agency Portal - Supabase Database Schema
-- Run this in your Supabase SQL editor

-- ============================================
-- TABLES
-- ============================================

-- clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('starter', 'pro', 'enterprise')) DEFAULT 'starter',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- client_profiles table
CREATE TABLE IF NOT EXISTS client_profiles (
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
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- training_conversations table
CREATE TABLE IF NOT EXISTS training_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  conversation_data JSONB DEFAULT '{}',
  flagged BOOLEAN DEFAULT FALSE,
  feedback TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'fixed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES (for performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clients_clerk_user_id ON clients(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_client_id ON chat_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_conversations_client_id ON training_conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_training_conversations_flagged ON training_conversations(flagged) WHERE flagged = true;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view own client data" ON clients;
DROP POLICY IF EXISTS "Users can insert own client data" ON clients;
DROP POLICY IF EXISTS "Users can update own client data" ON clients;

DROP POLICY IF EXISTS "Users can view own profile" ON client_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON client_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON client_profiles;

DROP POLICY IF EXISTS "Users can view own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON chat_messages;

DROP POLICY IF EXISTS "Users can view own training data" ON training_conversations;
DROP POLICY IF EXISTS "Users can insert own training data" ON training_conversations;
DROP POLICY IF EXISTS "Users can update own training data" ON training_conversations;

-- Clients table policies
CREATE POLICY "Users can view own client data" ON clients
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own client data" ON clients
  FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own client data" ON clients
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Client profiles policies
CREATE POLICY "Users can view own profile" ON client_profiles
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own profile" ON client_profiles
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own profile" ON client_profiles
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Chat messages policies
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Training conversations policies
CREATE POLICY "Users can view own training data" ON training_conversations
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own training data" ON training_conversations
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own training data" ON training_conversations
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM clients WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- ============================================
-- FUNCTIONS (optional helpers)
-- ============================================

-- Function to get profile completion percentage
CREATE OR REPLACE FUNCTION get_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  profile client_profiles;
  total_fields INTEGER := 12;
  completed_fields INTEGER := 0;
BEGIN
  SELECT * INTO profile FROM client_profiles WHERE id = profile_id;
  
  IF profile IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Count brand_data fields
  IF profile.brand_data ? 'company_name' THEN completed_fields := completed_fields + 1; END IF;
  IF profile.brand_data ? 'website' THEN completed_fields := completed_fields + 1; END IF;
  IF profile.brand_data ? 'industry' THEN completed_fields := completed_fields + 1; END IF;
  IF profile.brand_data ? 'colors' THEN completed_fields := completed_fields + 1; END IF;
  IF profile.brand_data ? 'logo_url' THEN completed_fields := completed_fields + 1; END IF;
  
  -- Count business_context fields
  IF profile.business_context ? 'products' THEN completed_fields := completed_fields + 1; END IF;
  IF profile.business_context ? 'faqs' THEN completed_fields := completed_fields + 1; END IF;
  IF profile.business_context ? 'policies' THEN completed_fields := completed_fields + 1; END IF;
  
  -- Count voice_personality fields
  IF profile.voice_personality ? 'tone' THEN completed_fields := completed_fields + 1; END IF;
  IF profile.voice_personality ? 'examples' THEN completed_fields := completed_fields + 1; END IF;
  IF profile.voice_personality ? 'greeting' THEN completed_fields := completed_fields + 1; END IF;
  IF profile.voice_personality ? 'signoff' THEN completed_fields := completed_fields + 1; END IF;
  
  RETURN ROUND((completed_fields::NUMERIC / total_fields::NUMERIC) * 100);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SUCCESS!
-- ============================================

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'client_profiles', 'chat_messages', 'training_conversations');

-- You should see 4 rows returned
