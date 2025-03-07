import React, { useState, useRef, useEffect } from 'react';
import { Key, Send, Settings } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { useChat } from '../../hooks/useChat';

export function ChatWidget() {
  const { activeKey } = useAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useChat({
    apiKey: activeKey?.key,
    onError: (error) => console.error('Chat error:', error)
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
  };

  if (!activeKey) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium text-slate-800 dark:text-white">
            Connect to OpenAI
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Add and select an OpenAI API key to start chatting
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openSettings', { 
              detail: { section: 'ai' } 
            }))}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-cyan-500 dark:to-cyan-400 text-white rounded-lg hover:brightness-110 transition-all group"
          >
            <Settings className="w-4 h-4 transition-transform group-hover:rotate-45" />
            <span>Open Settings</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* API Key Info */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-black/50">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Key className="w-4 h-4" />
          <span>Using: {activeKey.name}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
              msg.role === 'user'
                ? 'bg-indigo-500 dark:bg-cyan-500 text-white'
                : msg.error
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white dark:bg-black border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
            onKeyDown={(e) => e.stopPropagation()}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-indigo-500 dark:bg-cyan-500 text-white rounded-lg hover:bg-indigo-600 dark:hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}