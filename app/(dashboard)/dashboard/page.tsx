import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Let's build your AI team member together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusCard
            title="Onboarding"
            status="In Progress"
            description="Complete your onboarding chat to set up your agent"
            href="/onboarding"
            buttonText="Continue Setup"
          />
          
          <StatusCard
            title="Training"
            status="Locked"
            description="Available after onboarding is complete"
            href="/training"
            buttonText="View Training"
            disabled
          />
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  status,
  description,
  href,
  buttonText,
  disabled = false,
}: {
  title: string;
  status: string;
  description: string;
  href: string;
  buttonText: string;
  disabled?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className={`text-sm px-3 py-1 rounded-full ${
          status === 'In Progress' 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {status}
        </span>
      </div>
      <p className="text-gray-600">{description}</p>
      <a
        href={disabled ? '#' : href}
        className={`inline-block px-4 py-2 rounded-lg transition ${
          disabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {buttonText}
      </a>
    </div>
  );
}
