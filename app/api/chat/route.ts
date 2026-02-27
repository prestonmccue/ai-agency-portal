import { auth } from '@clerk/nextjs/server';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are an expert onboarding specialist helping clients set up their AI agent for their business.

Your goal is to gather information through natural conversation - NOT static forms. Make it feel like talking to a helpful consultant, not filling out paperwork.

CURRENT STAGE: brand_basics

STAGES TO COMPLETE:
1. **Brand & Basics** - Company name, website, industry, logo, brand colors
2. **Business Context** - Products/services, FAQs, policies, current tools
3. **Voice & Personality** - Tone, sample messages, words to use/avoid
4. **Review & Launch** - Show summary, get approval

CONVERSATION GUIDELINES:
- Ask ONE question at a time
- Keep it conversational and friendly
- Use their company name once you know it
- Show progress: "Great! We've covered X, Y. Next up: Z"
- Validate and confirm before moving on
- Auto-save their answers (you'll call functions for this)

CURRENT FOCUS (Brand & Basics):
Start by asking: "What's your company name?"

Then gather:
- Company website
- Industry/vertical (e-commerce, SaaS, local business, etc.)
- Brand colors (if they know them, otherwise you can grab from their site later)

Once you have these basics, tell them:
"Perfect! I have your brand basics saved. Next, I'll ask about your products and how you help customers."

Then transition to the Business Context stage.

PERSONALITY:
- Friendly but professional
- Use emojis sparingly (1-2 per message max)
- Celebrate small wins: "Nice!" "Got it!" "Perfect!"
- If they seem confused, clarify
- If they give a long answer, acknowledge: "Thanks for all that detail!"

Remember: Make this feel like a conversation with a smart assistant, not an interrogation.`;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, clientId } = await req.json();

    // Call OpenRouter with Claude Sonnet
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
        'X-Title': 'AI Agency Portal',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return new Response('Error calling AI service', { status: 500 });
    }

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    
    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
