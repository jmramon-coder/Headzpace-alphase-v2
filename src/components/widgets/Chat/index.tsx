import React, { useState, useRef, useEffect } from 'react';
import { Key, ChevronDown, Settings, Brain as BrainIcon, Send } from 'lucide-react';
import { useAI } from '../../../context/AIContext';
import { useChat } from '../../../hooks/useChat';

export function ChatWidget() {
  const { isAuthenticated, apiKeys, activeKey } = useAI();
  const [input, setInput] = useState('');
  const [showKeySelector, setShowKeySelector] = React.useState(false);
  const [selectedKeyId, setSelectedKeyId] = React.useState(activeKey?.id || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedKey = selectedKeyId 
    ? apiKeys.find(k => k.id === selectedKeyId)
    : activeKey;

  const { messages, isLoading, sendMessage } = useChat({
    apiKey: selectedKey?.key,
    onError: (error) => console.error('Chat error:', error)
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowKeySelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      try {
        await sendMessage(input);
        setInput('');
        
        // Focus input after sending
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {!isAuthenticated ? (
        <div className="h-full flex flex-col items-center justify-center p-4">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-indigo-500/20 dark:bg-cyan-500/20 rounded-full blur-lg animate-pulse" />
            <div className="relative p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 dark:from-cyan-500/10 dark:to-cyan-400/10 rounded-xl">
              <BrainIcon className="w-8 h-8 text-indigo-500 dark:text-cyan-500" />
            </div>
          </div>
          <h3 className="text-base font-medium text-indigo-600 dark:text-cyan-300 mb-1">
            Connect Your AI Assistant
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-4">
            Add your OpenAI API key to start chatting
          </p>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openSettings', { detail: { section: 'ai' } }));
            }}
            className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-cyan-500 dark:to-cyan-400 text-white rounded-lg hover:brightness-110 transition-all group"
          >
            <Key className="w-4 h-4" />
            <span>Add API Key</span>
            <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* API Key Selector */}
          <div className="px-4 py-2 border-b border-indigo-200 dark:border-cyan-500/20">
            <div
              ref={selectorRef}
              className="relative max-w-[200px] z-20"
            >
              <div
                onClick={() => setShowKeySelector(!showKeySelector)}
                className="w-full flex items-center justify-between gap-2 px-2 py-1 bg-white dark:bg-black/30 border border-indigo-200 dark:border-cyan-500/30 rounded-lg text-xs text-slate-800 dark:text-white hover:border-indigo-500 dark:hover:border-cyan-500 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-500" />
                  <span className="truncate max-w-[120px]">{selectedKey?.name || 'Select API Key'}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 group-hover:text-indigo-500 dark:group-hover:text-cyan-500 ${
                  showKeySelector ? 'rotate-180' : ''
                }`} />
              </div>

              {/* Dropdown */}
              {showKeySelector && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-black/90 rounded-lg shadow-xl border border-slate-200 dark:border-cyan-500/20 py-1 z-10 backdrop-blur-sm">
                  {apiKeys.map((key) => (
                    <button
                      key={key.id}
                      onClick={() => {
                        setSelectedKeyId(key.id);
                        setShowKeySelector(false);
                      }}
                      className={`w-full px-2 py-1 text-left text-xs flex items-center gap-2 ${
                        key.id === selectedKeyId
                          ? 'bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-300'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Key className={`w-2.5 h-2.5 ${
                        key.id === selectedKeyId
                          ? 'text-indigo-500 dark:text-cyan-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`} />
                      <span className="truncate">{key.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4 overscroll-contain">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${message.error ? 'opacity-75' : ''}`}
              >
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-indigo-500 dark:bg-cyan-500 text-white'
                    : `${message.error ? 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-200' : 'bg-indigo-100 dark:bg-cyan-500/20 text-slate-800 dark:text-white'}`
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-indigo-100 dark:bg-cyan-500/20">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-indigo-200 dark:border-cyan-500/20">
            <div className="flex gap-2 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-white dark:bg-black/30 border border-indigo-200 dark:border-cyan-500/30 rounded-lg px-4 py-2 text-slate-800 dark:text-white placeholder:text-indigo-400 dark:placeholder:text-cyan-500/50 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500 min-w-0"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="shrink-0 bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-cyan-500 dark:to-cyan-400 text-white rounded-lg hover:brightness-110 transition-all font-medium flex items-center justify-center px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}