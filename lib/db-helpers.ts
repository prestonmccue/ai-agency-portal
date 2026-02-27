import { supabase } from './supabase';
import type { Client, ClientProfile, ChatMessage } from './supabase';

// ============================================
// CLIENT OPERATIONS
// ============================================

/**
 * Get or create a client record for a Clerk user
 */
export async function getOrCreateClient(clerkUserId: string, email: string): Promise<Client | null> {
  try {
    // Check if client exists
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (existingClient) {
      return existingClient;
    }

    // Create new client if doesn't exist
    if (fetchError?.code === 'PGRST116') { // No rows returned
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          clerk_user_id: clerkUserId,
          email,
          tier: 'starter',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating client:', createError);
        return null;
      }

      // Create associated profile
      if (newClient) {
        await createClientProfile(newClient.id);
      }

      return newClient;
    }

    console.error('Error fetching client:', fetchError);
    return null;
  } catch (error) {
    console.error('Unexpected error in getOrCreateClient:', error);
    return null;
  }
}

/**
 * Create a blank client profile
 */
async function createClientProfile(clientId: string): Promise<void> {
  const { error } = await supabase
    .from('client_profiles')
    .insert({
      client_id: clientId,
      brand_data: {},
      business_context: {},
      voice_personality: {},
      onboarding_stage: 'brand',
    });

  if (error) {
    console.error('Error creating client profile:', error);
  }
}

// ============================================
// PROFILE OPERATIONS
// ============================================

/**
 * Get client profile by client ID
 */
export async function getClientProfile(clientId: string): Promise<ClientProfile | null> {
  const { data, error } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Update brand data in profile
 */
export async function updateBrandData(clientId: string, brandData: Partial<ClientProfile['brand_data']>): Promise<boolean> {
  const profile = await getClientProfile(clientId);
  if (!profile) return false;

  const { error } = await supabase
    .from('client_profiles')
    .update({
      brand_data: { ...profile.brand_data, ...brandData },
    })
    .eq('client_id', clientId);

  if (error) {
    console.error('Error updating brand data:', error);
    return false;
  }

  return true;
}

/**
 * Update business context in profile
 */
export async function updateBusinessContext(
  clientId: string,
  contextData: Partial<ClientProfile['business_context']>
): Promise<boolean> {
  const profile = await getClientProfile(clientId);
  if (!profile) return false;

  const { error } = await supabase
    .from('client_profiles')
    .update({
      business_context: { ...profile.business_context, ...contextData },
    })
    .eq('client_id', clientId);

  if (error) {
    console.error('Error updating business context:', error);
    return false;
  }

  return true;
}

/**
 * Update voice/personality in profile
 */
export async function updateVoicePersonality(
  clientId: string,
  voiceData: Partial<ClientProfile['voice_personality']>
): Promise<boolean> {
  const profile = await getClientProfile(clientId);
  if (!profile) return false;

  const { error } = await supabase
    .from('client_profiles')
    .update({
      voice_personality: { ...profile.voice_personality, ...voiceData },
    })
    .eq('client_id', clientId);

  if (error) {
    console.error('Error updating voice personality:', error);
    return false;
  }

  return true;
}

/**
 * Update onboarding stage
 */
export async function updateOnboardingStage(
  clientId: string,
  stage: ClientProfile['onboarding_stage']
): Promise<boolean> {
  const { error } = await supabase
    .from('client_profiles')
    .update({ onboarding_stage: stage })
    .eq('client_id', clientId);

  if (error) {
    console.error('Error updating onboarding stage:', error);
    return false;
  }

  return true;
}

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(profile: ClientProfile): number {
  let totalFields = 0;
  let completedFields = 0;

  // Brand data (5 fields)
  totalFields += 5;
  if (profile.brand_data.company_name) completedFields++;
  if (profile.brand_data.website) completedFields++;
  if (profile.brand_data.industry) completedFields++;
  if (profile.brand_data.colors && profile.brand_data.colors.length > 0) completedFields++;
  if (profile.brand_data.logo_url) completedFields++;

  // Business context (3 major sections)
  totalFields += 3;
  if (profile.business_context.products && profile.business_context.products.length > 0) completedFields++;
  if (profile.business_context.faqs && profile.business_context.faqs.length > 0) completedFields++;
  if (profile.business_context.policies && Object.keys(profile.business_context.policies).length > 0) completedFields++;

  // Voice personality (4 fields)
  totalFields += 4;
  if (profile.voice_personality.tone && profile.voice_personality.tone.length > 0) completedFields++;
  if (profile.voice_personality.examples && profile.voice_personality.examples.length > 0) completedFields++;
  if (profile.voice_personality.greeting) completedFields++;
  if (profile.voice_personality.signoff) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
}

// ============================================
// CHAT MESSAGE OPERATIONS
// ============================================

/**
 * Save a chat message to the database
 */
export async function saveChatMessage(
  clientId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata: Record<string, any> = {}
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      client_id: clientId,
      role,
      content,
      metadata,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving chat message:', error);
    return null;
  }

  return data;
}

/**
 * Get chat history for a client (last N messages)
 */
export async function getChatHistory(clientId: string, limit: number = 50): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }

  return data || [];
}

/**
 * Get the last message timestamp for a client
 */
export async function getLastMessageTime(clientId: string): Promise<Date | null> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return new Date(data.created_at);
}
