import React from 'react';
import { Key, Trash2, Check } from 'lucide-react';
import { useAI } from '../../../../context/AIContext';

export const APIKeyList = () => {
  const { apiKeys, activeKey, removeApiKey, setActiveKey } = useAI();

  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
        No API keys added yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {apiKeys.map(key => (
        <div 
          key={key.id}
          className={`bg-white/80 dark:bg-black/30 border rounded-lg p-4 ${
            key.id === activeKey?.id
              ? 'border-indigo-500 dark:border-cyan-500'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className={`w-4 h-4 ${
                key.id === activeKey?.id
                  ? 'text-indigo-500 dark:text-cyan-500'
                  : 'text-slate-400 dark:text-slate-500'
              }`} />
              <span className="font-medium text-slate-800 dark:text-white">
                {key.name}
              </span>
              {key.id !== activeKey?.id && (
                <button
                  onClick={() => setActiveKey(key.id)}
                  className="ml-2 text-xs px-2 py-0.5 bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 rounded-full hover:bg-indigo-100 dark:hover:bg-cyan-500/20 transition-colors"
                >
                  Set as Default
                </button>
              )}
              {key.id === activeKey?.id && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Default</span>
                </span>
              )}
            </div>
            <button
              onClick={() => removeApiKey(key.id)}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              title="Remove API key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {/* Show masked API key */}
            {key.key.substring(0, 3)}...{key.key.slice(-4)}
          </div>
        </div>
      ))}
    </div>
  );
};