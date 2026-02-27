import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Home, MessageSquare, Settings, GraduationCap } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold">AI Agency Portal</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink href="/dashboard" icon={<Home size={20} />}>
            Dashboard
          </NavLink>
          <NavLink href="/onboarding" icon={<MessageSquare size={20} />}>
            Onboarding
          </NavLink>
          <NavLink href="/training" icon={<GraduationCap size={20} />}>
            Training
          </NavLink>
          <NavLink href="/settings" icon={<Settings size={20} />}>
            Settings
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-gray-600">Account</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
