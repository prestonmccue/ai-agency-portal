import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Legacy export for compatibility - lazy loaded
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  },
});

// Types for our database schema
export type Client = {
  id: string;
  clerk_user_id: string;
  company_name: string | null;
  email: string;
  tier: 'starter' | 'pro' | 'enterprise';
  created_at: string;
};

export type ClientProfile = {
  id: string;
  client_id: string;
  brand_data: {
    company_name?: string;
    website?: string;
    logo_url?: string;
    colors?: string[];
    industry?: string;
  };
  business_context: {
    products?: Array<{
      name: string;
      description: string;
      price?: number;
    }>;
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
    policies?: {
      refund?: string;
      support_hours?: string;
      [key: string]: string | undefined;
    };
    tools?: string[];
  };
  voice_personality: {
    tone?: string[];
    examples?: string[];
    words_to_use?: string[];
    words_to_avoid?: string[];
    greeting?: string;
    signoff?: string;
  };
  onboarding_stage: 'brand' | 'context' | 'voice' | 'review' | 'complete';
  completed_at: string | null;
};

export type ChatMessage = {
  id: string;
  client_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
};

export type TrainingConversation = {
  id: string;
  client_id: string;
  conversation_data: Record<string, any>;
  flagged: boolean;
  feedback: string | null;
  status: 'pending' | 'reviewed' | 'fixed';
  created_at: string;
};
