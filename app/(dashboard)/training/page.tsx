'use client';

import { useState } from 'react';
import { MessageSquare, Send, Eye, Flag, Check, X } from 'lucide-react';

export default function TrainingPage() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showConversationsModal, setShowConversationsModal] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) return;
    // Simulate sending feedback
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSent(false);
      setFeedback('');
    }, 1500);
  };

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
            <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: '17%' }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">17% complete</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="Accuracy" value="87%" target="90%" trend="up" />
          <MetricCard title="Escalation Rate" value="22%" target="<20%" trend="down" />
          <MetricCard title="Avg Response Time" value="1.2 min" trend="stable" />
        </div>

        {/* Recent Conversations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold mb-4">Recent Conversations</h2>
          <div className="space-y-4">
            <ConversationItem
              summary="Customer asked about refund policy"
              outcome="Agent handled correctly"
              status="success"
            />
            <ConversationItem
              summary="Customer was frustrated about delay"
              outcome="Escalated to human support"
              status="success"
            />
            <ConversationItem
              summary="Product pricing question"
              outcome="Agent provided wrong price"
              status="flagged"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => setShowFeedbackModal(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Send size={18} />
            Submit Feedback
          </button>
          <button 
            onClick={() => setShowConversationsModal(true)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Eye size={18} />
            View All Conversations
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Submit Feedback</h3>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            {feedbackSent ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <p className="text-lg font-medium">Feedback Submitted!</p>
                <p className="text-gray-600">We'll use this to improve your agent.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600">
                  Help us improve your AI agent by sharing what's working and what needs adjustment.
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g., The agent is too formal, needs to be more friendly..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitFeedback}
                    className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    Send Feedback
                  </button>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Conversations Modal */}
      {showConversationsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">All Conversations</h3>
              <button 
                onClick={() => setShowConversationsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">Conversation #{100 - i}</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Customer inquiry about product availability...</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Resolved</span>
                    <span className="text-xs text-gray-500">4 messages</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  target,
  trend 
}: { 
  title: string; 
  value: string; 
  target?: string;
  trend?: 'up' | 'down' | 'stable';
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold">{value}</p>
        {trend === 'up' && <span className="text-green-600 text-sm">↑</span>}
        {trend === 'down' && <span className="text-red-600 text-sm">↓</span>}
      </div>
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
  const [flagged, setFlagged] = useState(false);

  return (
    <div className={`border-l-4 ${status === 'success' ? 'border-green-500' : 'border-orange-500'} pl-4 py-2`}>
      <p className="font-medium">{summary}</p>
      <p className={`text-sm mt-1 flex items-center gap-1 ${
        status === 'success' ? 'text-green-600' : 'text-orange-600'
      }`}>
        {status === 'success' && <Check size={14} />}
        {outcome}
      </p>
      {status === 'flagged' && !flagged && (
        <button 
          onClick={() => setFlagged(true)}
          className="text-sm text-blue-600 mt-2 hover:underline flex items-center gap-1"
        >
          <Flag size={14} />
          Flag for Review
        </button>
      )}
      {flagged && (
        <span className="text-sm text-orange-600 mt-2 flex items-center gap-1">
          <Flag size={14} />
          Flagged - Under Review
        </span>
      )}
    </div>
  );
}
