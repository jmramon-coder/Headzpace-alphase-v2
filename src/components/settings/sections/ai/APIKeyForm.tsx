import React, { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { useAI } from '../../../../context/AIContext';

interface Props {
  onCancel: () => void;
}

export const APIKeyForm = ({ onCancel }: Props) => {
  const { addApiKey, error: contextError } = useAI();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!key.trim()) {
        throw new Error('API key is required');
      }
      
      if (!key.trim().startsWith('sk-')) {
        throw new Error('Invalid API key format. Key should start with "sk-"');
      }
      
      setIsLoading(true);
      await addApiKey(name.trim() || 'Default Key', key.trim());
      
      setName('');
      setKey('');
      onCancel();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Key Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., GPT-3.5 Key"
          className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          OpenAI API Key
        </label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type={showKey ? 'text' : 'password'}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-10 py-2 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
            placeholder="sk-..."
            required
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Your API key is stored locally and never sent to our servers.
        </p>
        <p className="mt-1 text-xs text-indigo-600 dark:text-cyan-400">
          Get your OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a>
        </p>
      </div>

      {(error || contextError) && (
        <p className="text-sm text-red-600 dark:text-red-400">{error || contextError}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-cyan-500 dark:to-cyan-400 text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative"
        >
          {isLoading ? (
            <>
              <span className="opacity-0">Add Key</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            </>
          ) : (
            'Add Key'
          )}
        </button>
      </div>
    </form>
  );
};