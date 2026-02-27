import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ChatInterface } from '@/components/chat-interface';

export default async function OnboardingPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Let's Build Your AI Agent</h1>
          <p className="text-gray-600 mt-2">
            Have a conversation with our onboarding assistant - no boring forms, just chat!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">Your Progress</h2>
          <div className="flex items-center gap-4">
            <ProgressStep label="Brand & Basics" status="current" />
            <ProgressArrow />
            <ProgressStep label="Business Context" status="pending" />
            <ProgressArrow />
            <ProgressStep label="Voice & Personality" status="pending" />
            <ProgressArrow />
            <ProgressStep label="Review & Launch" status="pending" />
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <ChatInterface clientId={userId} />
        </div>
      </div>
    </div>
  );
}

function ProgressStep({ label, status }: { label: string; status: 'complete' | 'current' | 'pending' }) {
  return (
    <div className="flex-1 text-center">
      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
        status === 'complete' ? 'bg-green-500 text-white' :
        status === 'current' ? 'bg-black text-white' :
        'bg-gray-200 text-gray-500'
      }`}>
        {status === 'complete' ? '✓' : 
         status === 'current' ? '→' : '⏳'}
      </div>
      <p className={`text-sm ${status === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}>
        {label}
      </p>
    </div>
  );
}

function ProgressArrow() {
  return <div className="text-gray-300 text-2xl">→</div>;
}
