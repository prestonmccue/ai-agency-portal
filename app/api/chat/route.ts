import { auth, currentUser } from '@clerk/nextjs/server';
import {
  getOrCreateClient,
  getChatHistory,
  saveChatMessage,
  getClientProfile,
  updateBrandData,
  updateBusinessContext,
  updateVoicePersonality,
  updateOnboardingStage,
} from '@/lib/db-helpers';

export const runtime = 'edge';

// Function definitions for data extraction
const FUNCTIONS = [
  {
    name: 'save_brand_info',
    description: 'Save brand and company basic information',
    parameters: {
      type: 'object',
      properties: {
        company_name: { type: 'string', description: 'Company name' },
        website: { type: 'string', description: 'Company website URL' },
        industry: { type: 'string', description: 'Industry or vertical (e.g., e-commerce, SaaS, healthcare)' },
        colors: { type: 'array', items: { type: 'string' }, description: 'Brand colors (hex codes)' },
        logo_url: { type: 'string', description: 'Logo URL (if provided)' },
      },
      required: [],
    },
  },
  {
    name: 'save_product',
    description: 'Save a product or service offering',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product or service name' },
        description: { type: 'string', description: 'Product description' },
        price: { type: 'number', description: 'Price (optional)' },
      },
      required: ['name', 'description'],
    },
  },
  {
    name: 'save_faq',
    description: 'Save a frequently asked question and answer',
    parameters: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'The question' },
        answer: { type: 'string', description: 'The answer' },
      },
      required: ['question', 'answer'],
    },
  },
  {
    name: 'save_policy',
    description: 'Save a business policy (refund, support hours, etc.)',
    parameters: {
      type: 'object',
      properties: {
        policy_type: { type: 'string', description: 'Type of policy (e.g., refund, support_hours, shipping)' },
        policy_text: { type: 'string', description: 'The policy details' },
      },
      required: ['policy_type', 'policy_text'],
    },
  },
  {
    name: 'save_voice_traits',
    description: 'Save voice and personality traits for the AI agent',
    parameters: {
      type: 'object',
      properties: {
        tone: { type: 'array', items: { type: 'string' }, description: 'Tone descriptors (e.g., friendly, professional)' },
        examples: { type: 'array', items: { type: 'string' }, description: 'Example messages in desired voice' },
        words_to_use: { type: 'array', items: { type: 'string' }, description: 'Preferred words/phrases' },
        words_to_avoid: { type: 'array', items: { type: 'string' }, description: 'Words/phrases to avoid' },
        greeting: { type: 'string', description: 'Agent greeting message' },
        signoff: { type: 'string', description: 'Agent sign-off message' },
      },
      required: [],
    },
  },
  {
    name: 'advance_stage',
    description: 'Move to the next onboarding stage',
    parameters: {
      type: 'object',
      properties: {
        stage: {
          type: 'string',
          enum: ['brand', 'context', 'voice', 'review', 'complete'],
          description: 'The stage to move to',
        },
      },
      required: ['stage'],
    },
  },
];

function buildSystemPrompt(stage: string, profile: any): string {
  return `You are an expert onboarding specialist helping clients set up their AI agent for their business.

Your goal is to gather information through natural conversation - NOT static forms. Make it feel like talking to a helpful consultant, not filling out paperwork.

CURRENT STAGE: ${stage}

STAGES TO COMPLETE:
1. **brand** - Company name, website, industry, logo, brand colors
2. **context** - Products/services, FAQs, policies, current tools
3. **voice** - Tone, sample messages, words to use/avoid
4. **review** - Show summary, get approval

ALREADY COLLECTED:
${JSON.stringify(profile, null, 2)}

CONVERSATION GUIDELINES:
- Ask ONE question at a time
- Keep it conversational and friendly
- Use their company name once you know it: "${profile?.brand_data?.company_name || '[Company]'}"
- Show progress: "Great! We've covered X, Y. Next up: Z"
- Validate and confirm before moving on
- When you extract info, call the appropriate save function
- After confirming save, acknowledge: "✓ Saved to your profile"

FUNCTION CALLING:
When the user provides information, extract it and call the appropriate function:
- Company basics → save_brand_info()
- Product/service → save_product()
- FAQ → save_faq()
- Policy → save_policy()
- Voice traits → save_voice_traits()
- When stage is complete → advance_stage()

STAGE-SPECIFIC INSTRUCTIONS:

**brand stage:**
Start by asking: "What's your company name?"
Then gather: website, industry, brand colors
Once you have basics, call advance_stage({stage: "context"})

**context stage:**
Ask about products/services, common questions, policies
Gather at least 2-3 products, 3-5 FAQs, and key policies (refund, support)
Call advance_stage({stage: "voice"}) when sufficient

**voice stage:**
Ask how they want their AI to sound (friendly? professional? playful?)
Get example messages, preferred words
Call advance_stage({stage: "review"}) when done

**review stage:**
Show summary of all collected data
Ask for approval or edits
Call advance_stage({stage: "complete"}) when approved

PERSONALITY:
- Friendly but professional
- Use emojis sparingly (1-2 per message max)
- Celebrate small wins: "Nice!" "Got it!" "Perfect!"
- If they seem confused, clarify
- If they give a long answer, acknowledge: "Thanks for all that detail!"

Remember: Make this feel like a conversation with a smart assistant, not an interrogation.`;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { messages } = body;

    // Get or create client record
    const email = user.emailAddresses[0]?.emailAddress || user.id;
    const client = await getOrCreateClient(userId, email);

    if (!client) {
      return new Response('Error creating client record', { status: 500 });
    }

    // Get client profile for context
    const profile = await getClientProfile(client.id);
    const currentStage = profile?.onboarding_stage || 'brand';

    // Load chat history (last 20 messages for context)
    const history = await getChatHistory(client.id, 20);

    // Save the user's latest message
    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage && latestUserMessage.role === 'user') {
      await saveChatMessage(client.id, 'user', latestUserMessage.content);
    }

    // Build system prompt with current state
    const systemPrompt = buildSystemPrompt(currentStage, profile);

    // Call OpenRouter with function calling
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Agency Portal',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        functions: FUNCTIONS,
        stream: false, // Need to handle function calls first
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return new Response('Error calling AI service', { status: 500 });
    }

    const data = await response.json();
    const completion = data.choices[0].message;

    // Handle function calls
    if (completion.function_call) {
      const functionName = completion.function_call.name;
      const functionArgs = JSON.parse(completion.function_call.arguments);

      console.log(`[Function Call] ${functionName}:`, functionArgs);

      let success = false;

      switch (functionName) {
        case 'save_brand_info':
          success = await updateBrandData(client.id, functionArgs);
          break;

        case 'save_product':
          if (profile) {
            const products = profile.business_context.products || [];
            products.push(functionArgs);
            success = await updateBusinessContext(client.id, { products });
          }
          break;

        case 'save_faq':
          if (profile) {
            const faqs = profile.business_context.faqs || [];
            faqs.push(functionArgs);
            success = await updateBusinessContext(client.id, { faqs });
          }
          break;

        case 'save_policy':
          if (profile) {
            const policies = profile.business_context.policies || {};
            policies[functionArgs.policy_type] = functionArgs.policy_text;
            success = await updateBusinessContext(client.id, { policies });
          }
          break;

        case 'save_voice_traits':
          success = await updateVoicePersonality(client.id, functionArgs);
          break;

        case 'advance_stage':
          success = await updateOnboardingStage(client.id, functionArgs.stage);
          break;
      }

      // Add metadata about the function call to the message
      const metadata = {
        function_call: functionName,
        function_args: functionArgs,
        success,
      };

      // Save assistant response with metadata
      await saveChatMessage(client.id, 'assistant', completion.content || '', metadata);

      // Return the assistant's message (after function call)
      return new Response(
        JSON.stringify({
          role: 'assistant',
          content: completion.content || '✓ Data saved successfully!',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // No function call - just save and return the message
    await saveChatMessage(client.id, 'assistant', completion.content);

    return new Response(
      JSON.stringify({
        role: 'assistant',
        content: completion.content,
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
