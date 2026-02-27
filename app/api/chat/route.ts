export const dynamic = 'force-dynamic';

import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = getSupabase();

    // Get or create client
    let { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (!client) {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({ clerk_user_id: userId, email: userId })
        .select()
        .single();
      client = newClient;

      if (client) {
        await supabase.from('client_profiles').insert({ client_id: client.id });
      }
    }

    // Get profile
    const { data: profile } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('client_id', client?.id)
      .single();

    const stage = profile?.onboarding_stage || 'brand';

    // Save user message
    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage?.role === 'user' && client) {
      await supabase.from('chat_messages').insert({
        client_id: client.id,
        role: 'user',
        content: latestUserMessage.content,
      });
    }

    const systemPrompt = `You are an expert onboarding specialist helping clients set up their AI agent.

CURRENT STAGE: ${stage}
COMPANY: ${profile?.brand_data?.company_name || 'Unknown'}

STAGES:
1. brand - Company name, website, industry, colors
2. context - Products/services, FAQs, policies  
3. voice - Tone, examples, words to use/avoid
4. review - Summary and approval

COLLECTED DATA:
${JSON.stringify(profile || {}, null, 2)}

Ask ONE question at a time. Be conversational. Celebrate progress.
Start with: "What's your company name?" if brand stage and no company name.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://ai-agency-portal.vercel.app',
        'X-Title': 'AI Agency Portal',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Sorry, please try again.';

    if (client) {
      await supabase.from('chat_messages').insert({
        client_id: client.id,
        role: 'assistant',
        content,
      });
    }

    return new Response(
      JSON.stringify({ role: 'assistant', content }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
