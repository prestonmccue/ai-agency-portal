export const dynamic = 'force-dynamic';

// Simplified chat API without Clerk auth for now
// TODO: Add proper auth once middleware issues resolved

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, clientId } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert onboarding specialist helping clients set up their AI agent for their business.

Your goal is to gather information through natural conversation - NOT static forms. Make it feel like talking to a helpful consultant.

STAGES TO COMPLETE:
1. **brand** - Company name, website, industry, brand colors
2. **context** - Products/services, FAQs, policies
3. **voice** - Tone, sample messages, words to use/avoid
4. **review** - Show summary, get approval

CONVERSATION GUIDELINES:
- Ask ONE question at a time
- Keep it conversational and friendly
- Show progress naturally
- Celebrate small wins: "Great!" "Got it!" "Perfect!"

Start by asking for the company name if this is a new conversation.`;

    // Call OpenRouter
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
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return new Response(JSON.stringify({ error: 'AI service error', details: error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Sorry, I had trouble responding. Please try again.';

    return new Response(
      JSON.stringify({
        role: 'assistant',
        content,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
