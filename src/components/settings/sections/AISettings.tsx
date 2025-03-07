import React from 'react';
import { Key, MessageCircle, Plus } from 'lucide-react';
import { useAI } from '../../../context/AIContext';
import { APIKeyForm } from './ai/APIKeyForm';
import { APIKeyList } from './ai/APIKeyList';
import { AIStatusBanner } from './ai/AIStatusBanner';

export const AISettings = () => {
  const { apiKeys } = useAI();
  const [showAddForm, setShowAddForm] = React.useState(false);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
        AI Intelligence
      </h3>
      
      <AIStatusBanner isAuthenticated={apiKeys.length > 0} />
      
      {/* API Keys Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            API Keys
          </h4>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 dark:text-cyan-400 hover:text-indigo-700 dark:hover:text-cyan-300 hover:bg-indigo-50 dark:hover:bg-cyan-500/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Key</span>
          </button>
        </div>

        {showAddForm ? (
          <APIKeyForm onCancel={() => setShowAddForm(false)} />
        ) : (
          <APIKeyList />
        )}
      </div>

      {/* Multi-Model Chat Info */}
      <div className="mt-6 p-4 bg-indigo-50 dark:bg-cyan-500/10 rounded-lg">
        <div className="flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-indigo-500 dark:text-cyan-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-slate-800 dark:text-white mb-1">
              Multi-Model Chat
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Add multiple API keys to enable the multi-model chat feature. This allows you to send the same query to different models and compare their responses.
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
              <li>Add multiple OpenAI API keys</li>
              <li>Use the master tab to broadcast to all chats</li>
              <li>Select specific chats to target with your messages</li>
              <li>Each chat can use a different model or API key</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};