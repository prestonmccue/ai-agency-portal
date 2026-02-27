export const dynamic = 'force-dynamic';

import { getSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const supabase = getSupabase();
    
    // For now, return empty history (auth will be added later)
    return new Response(
      JSON.stringify({
        messages: [],
        profile: null,
        clientId: null,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('History API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
