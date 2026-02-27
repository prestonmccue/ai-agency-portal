import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateClient, getChatHistory, getClientProfile } from '@/lib/db-helpers';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get or create client record
    const email = user.emailAddresses[0]?.emailAddress || user.id;
    const client = await getOrCreateClient(userId, email);

    if (!client) {
      return new Response('Error fetching client', { status: 500 });
    }

    // Get chat history and profile
    const messages = await getChatHistory(client.id, 100);
    const profile = await getClientProfile(client.id);

    return new Response(
      JSON.stringify({
        messages: messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.created_at,
        })),
        profile,
        clientId: client.id,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('History API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
