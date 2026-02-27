export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = getSupabase();

    // Get client
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (!client) {
      return new Response(
        JSON.stringify({ messages: [], profile: null, clientId: null }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get chat history
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: true })
      .limit(100);

    // Get profile
    const { data: profile } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('client_id', client.id)
      .single();

    return new Response(
      JSON.stringify({
        messages: (messages || []).map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.created_at,
        })),
        profile,
        clientId: client.id,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('History API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
