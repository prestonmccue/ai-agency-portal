export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-2">
            Update your business information and preferences
          </p>
        </div>

        {/* Company Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold mb-4">Company Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your Company Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input 
                type="url" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://yourcompany.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                <option>E-commerce</option>
                <option>SaaS</option>
                <option>Local Business</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Plan</label>
              <p className="text-gray-600">Starter - $750/month</p>
              <button className="text-sm text-blue-600 mt-1 hover:underline">
                Upgrade Plan
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Billing</label>
              <button className="text-sm text-blue-600 hover:underline">
                Manage Billing
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
          Save Changes
        </button>
      </div>
    </div>
  );
}
