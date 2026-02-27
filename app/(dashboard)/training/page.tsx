import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function TrainingPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Training Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Watch your agent learn and improve over time
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Training Progress</h2>
            <span className="text-sm text-gray-600">Day 5 of 30</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="bg-blue-500 h-3 rounded-full" style={{ width: '17%' }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">17% complete</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="Accuracy" value="87%" target="90%" />
          <MetricCard title="Escalation Rate" value="22%" target="<20%" />
          <MetricCard title="Avg Response Time" value="1.2 min" />
        </div>

        {/* Recent Conversations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold mb-4">Recent Conversations</h2>
          <div className="space-y-4">
            <ConversationItem
              summary="Customer asked about refund policy"
              outcome="Agent handled correctly ✓"
              status="success"
            />
            <ConversationItem
              summary="Customer was frustrated about delay"
              outcome="Escalated to human support ✓"
              status="success"
            />
            <ConversationItem
              summary="Product pricing question"
              outcome="Agent provided wrong price"
              status="flagged"
            />
          </div>
        </div>

        {/* Feedback Button */}
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
            Submit Feedback
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            View All Conversations
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, target }: { title: string; value: string; target?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      {target && <p className="text-sm text-gray-500 mt-1">Target: {target}</p>}
    </div>
  );
}

function ConversationItem({ 
  summary, 
  outcome, 
  status 
}: { 
  summary: string; 
  outcome: string; 
  status: 'success' | 'flagged';
}) {
  return (
    <div className="border-l-4 border-gray-200 pl-4 py-2">
      <p className="font-medium">{summary}</p>
      <p className={`text-sm mt-1 ${
        status === 'success' ? 'text-green-600' : 'text-orange-600'
      }`}>
        {outcome}
      </p>
      {status === 'flagged' && (
        <button className="text-sm text-blue-600 mt-2 hover:underline">
          Flag Issue
        </button>
      )}
    </div>
  );
}
