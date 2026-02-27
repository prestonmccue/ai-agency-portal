'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Save, Check, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: 'E-commerce',
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpgrade = () => {
    // Open Stripe billing portal or upgrade modal
    window.open('https://calendly.com', '_blank'); // Replace with actual billing link
  };

  const handleManageBilling = () => {
    // Open Stripe customer portal
    window.open('https://billing.stripe.com', '_blank'); // Replace with actual portal
  };

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
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your Company Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input 
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://yourcompany.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <select 
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option>E-commerce</option>
                <option>SaaS</option>
                <option>Local Business</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Home Services</option>
                <option>Professional Services</option>
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
              <button 
                onClick={handleUpgrade}
                className="text-sm text-blue-600 mt-1 hover:underline flex items-center gap-1"
              >
                Upgrade Plan
                <ExternalLink size={14} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Billing</label>
              <button 
                onClick={handleManageBilling}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                Manage Billing
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold mb-4">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm">Email me when my AI handles a conversation</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm">Weekly performance summary</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm">Alert me when AI escalates to human</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check size={18} />
              Saved!
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
