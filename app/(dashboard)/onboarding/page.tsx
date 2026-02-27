export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ChatInterface } from '@/components/chat-interface';
import { getOrCreateClient, getClientProfile, calculateProfileCompletion } from '@/lib/db-helpers';
import { currentUser } from '@clerk/nextjs/server';

export default async function OnboardingPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Get client and profile to show current stage
  const email = user.emailAddresses[0]?.emailAddress || userId;
  const client = await getOrCreateClient(userId, email);
  const profile = client ? await getClientProfile(client.id) : null;
  
  const currentStage = profile?.onboarding_stage || 'brand';
  const completionPercentage = profile ? calculateProfileCompletion(profile) : 0;

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Your Progress</h2>
            <span className="text-sm text-gray-600">{completionPercentage}% complete</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-black h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Stage Steps */}
          <div className="flex items-center gap-4">
            <ProgressStep
              label="Brand & Basics"
              status={getStageStatus('brand', currentStage)}
            />
            <ProgressArrow />
            <ProgressStep
              label="Business Context"
              status={getStageStatus('context', currentStage)}
            />
            <ProgressArrow />
            <ProgressStep
              label="Voice & Personality"
              status={getStageStatus('voice', currentStage)}
            />
            <ProgressArrow />
            <ProgressStep
              label="Review & Launch"
              status={getStageStatus('review', currentStage)}
            />
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

function getStageStatus(
  stage: string,
  currentStage: string
): 'complete' | 'current' | 'pending' {
  const stageOrder = ['brand', 'context', 'voice', 'review', 'complete'];
  const stageIndex = stageOrder.indexOf(stage);
  const currentIndex = stageOrder.indexOf(currentStage);

  if (currentIndex > stageIndex) return 'complete';
  if (currentIndex === stageIndex) return 'current';
  return 'pending';
}

function ProgressStep({
  label,
  status,
}: {
  label: string;
  status: 'complete' | 'current' | 'pending';
}) {
  return (
    <div className="flex-1 text-center">
      <div
        className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-all ${
          status === 'complete'
            ? 'bg-green-500 text-white'
            : status === 'current'
            ? 'bg-black text-white'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {status === 'complete' ? '✓' : status === 'current' ? '→' : '⏳'}
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
