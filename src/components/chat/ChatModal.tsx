import React, { useState, useRef, useEffect } from 'react';
import { X, Expand, Minimize2, Key, Brain as BrainIcon } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useAI } from '../../context/AIContext';
import { ChatHeader } from './ChatHeader';
import { ChatTabs } from './ChatTabs';
import { MasterChatHeader } from './MasterChatHeader';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';
import type { ChatTab, ChatMessage } from '../../types';
import { initializeOpenAI, getOpenAIInstance, handleOpenAIError } from '../../utils/openai';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const createNewTab = (index: number): ChatTab => ({
  id: crypto.randomUUID(),
  name: `Chat ${index + 1}`,
  messages: []
});

export const ChatModal = ({ isOpen, onClose }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated, apiKeys, activeKey } = useAI();
  const [tabs, setTabs] = useState<ChatTab[]>([createNewTab(0)]);
  const [activeTabId, setActiveTabId] = useState('master');
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useScrollLock(isOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Track chat modal opening
  useEffect(() => {
    if (isOpen) {
      trackEvent(ANALYTICS_EVENTS.CHAT_OPEN, {
        mode: activeTabId === 'master' ? 'master' : 'single'
      });
    }
  }, [isOpen, activeTabId]);

  const activeTab = activeTabId === 'master' 
    ? { id: 'master', name: 'Master', messages: [] }
    : tabs.find(tab => tab.id === activeTabId)!;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeTab.messages]);

  useEffect(() => {
    if (isAuthenticated && tabs.length > 0) {
      // Add welcome message to empty tabs
      setTabs(prevTabs => prevTabs.map(tab => 
        tab.messages.length === 0
          ? {
              ...tab,
              messages: [{
                role: 'assistant',
                content: 'Hello! I\'m your AI assistant. How can I help you today?'
              }]
            }
          : tab
      ));
    }
  }, [isAuthenticated]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, activeTabId]);

  const handleNewTab = () => {
    if (tabs.length >= 5) return;
    const newTab = createNewTab(tabs.length);
    if (isAuthenticated) {
      newTab.messages = [{
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?'
      }];
    }
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    
    // Track new tab
    trackEvent(ANALYTICS_EVENTS.WIDGET_INTERACT, {
      action: 'new_chat_tab'
    });
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);
    if (id === activeTabId) {
      setActiveTabId(newTabs[0].id);
    }
    // Remove from selected tabs if present
    if (selectedTabs.includes(id)) {
      setSelectedTabs(prev => prev.filter(tabId => tabId !== id));
    }
    
    // Track close tab
    trackEvent(ANALYTICS_EVENTS.WIDGET_INTERACT, {
      action: 'close_chat_tab'
    });
  };

  const handleChangeApiKey = (tabId: string, apiKeyId: string) => {
    setTabs(tabs.map(tab =>
      tab.id === tabId ? { ...tab, apiKeyId } : tab
    ));
    
    // Track API key change
    trackEvent(ANALYTICS_EVENTS.WIDGET_INTERACT, {
      action: 'change_api_key',
      is_master: activeTabId === 'master'
    });
  };

  const getKeyForTab = (tabId: string): string | undefined => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return activeKey?.key;
    
    if (tab.apiKeyId) {
      const keyObj = apiKeys.find(k => k.id === tab.apiKeyId);
      return keyObj?.key;
    }
    
    return activeKey?.key;
  };

  const processChat = async (tabId: string, userMessage: string): Promise<ChatMessage> => {
    try {
      const apiKey = getKeyForTab(tabId);
      if (!apiKey) {
        throw new Error('No API key selected for this chat');
      }

      // Get current messages for this tab
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) {
        throw new Error('Chat tab not found');
      }

      // Initialize OpenAI with the tab's key
      initializeOpenAI(apiKey);
      const openai = getOpenAIInstance();
      
      // Prepare messages history
      const messageHistory = tab.messages.map(msg => ({
        role: msg.role as any,
        content: msg.content
      }));
      
      // Add user message to history
      messageHistory.push({ role: 'user', content: userMessage });
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        messages: messageHistory,
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response received from API');
      }
      
      return {
        role: 'assistant',
        content: response
      };
    } catch (error) {
      const errorMessage = handleOpenAIError(error);
      return {
        role: 'assistant',
        content: errorMessage,
        error: true
      };
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Get the input before clearing it to avoid race conditions
      const message = input;
      setInput('');
      
      // Track message sent
      trackEvent(ANALYTICS_EVENTS.CHAT_MESSAGE_SENT, {
        mode: activeTabId === 'master' ? 'master' : 'single',
        target_count: activeTabId === 'master' ? 
          (selectedTabs.length > 0 ? selectedTabs.length : tabs.length) : 1
      });
      
      // Process in master mode (to multiple tabs) or single tab mode
      if (activeTabId === 'master') {
        // Determine which tabs to send to
        const targetTabs = selectedTabs.length > 0 
          ? tabs.filter(tab => selectedTabs.includes(tab.id))
          : tabs;
        
        if (targetTabs.length === 0) {
          throw new Error('No tabs selected to send message to');
        }
        
        // Add user message to each target tab
        setTabs(prevTabs => prevTabs.map(tab => 
          targetTabs.some(t => t.id === tab.id)
            ? { ...tab, messages: [...tab.messages, { role: 'user', content: message }] }
            : tab
        ));
        
        // Process each target tab
        const responses = await Promise.all(
          targetTabs.map(async (tab) => {
            try {
              const response = await processChat(tab.id, message);
              return { tabId: tab.id, response };
            } catch (error) {
              console.error(`Error processing tab ${tab.id}:`, error);
              return { 
                tabId: tab.id, 
                response: {
                  role: 'assistant',
                  content: error instanceof Error ? error.message : 'An error occurred',
                  error: true
                }
              };
            }
          })
        );
        
        // Update each tab with its response
        setTabs(prevTabs => {
          return prevTabs.map(tab => {
            const responseEntry = responses.find(r => r.tabId === tab.id);
            if (responseEntry) {
              return {
                ...tab,
                messages: [...tab.messages, responseEntry.response]
              };
            }
            return tab;
          });
        });
      } else {
        // Single tab mode
        // Add user message
        setTabs(prevTabs => prevTabs.map(t => 
          t.id === activeTabId
            ? { ...t, messages: [...t.messages, { role: 'user', content: message }] }
            : t
        ));
        
        // Process the message
        const response = await processChat(activeTabId, message);
        
        // Add the response to the tab
        setTabs(prevTabs => prevTabs.map(t => 
          t.id === activeTabId 
            ? { ...t, messages: [...t.messages, response] }
            : t
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error in active tab
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      if (activeTabId === 'master') {
        // If in master mode, just show an alert
        alert(`Error: ${errorMessage}`);
      } else {
        // Add error to active tab
        setTabs(prevTabs => prevTabs.map(t => 
          t.id === activeTabId 
            ? { 
                ...t, 
                messages: [...t.messages, { 
                  role: 'assistant', 
                  content: errorMessage,
                  error: true 
                }] 
              }
            : t
        ));
      }
    } finally {
      setIsLoading(false);
      
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  if (!isOpen) return null;

  return (
    <div role="dialog" className={`fixed z-[200] transition-all duration-300 shadow-2xl ${
      isExpanded 
        ? 'inset-0 sm:inset-4 lg:inset-8' 
        : 'bottom-20 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 h-[32rem]'
    } overflow-hidden`}
    >
      <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md border border-indigo-200 dark:border-cyan-500/20 rounded-lg h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-200 dark:border-cyan-500/20">
          <h2 className="text-lg font-medium text-indigo-600 dark:text-cyan-300">AI Assistants</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsExpanded(!isExpanded);
                trackEvent(ANALYTICS_EVENTS.WIDGET_INTERACT, {
                  action: isExpanded ? 'minimize_chat' : 'expand_chat'
                });
              }}
              className="text-indigo-500 hover:text-indigo-600 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="text-indigo-500 hover:text-indigo-600 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {isAuthenticated && (
          <ChatTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={(id) => {
              setActiveTabId(id);
              trackEvent(ANALYTICS_EVENTS.WIDGET_INTERACT, {
                action: 'switch_tab',
                is_master: id === 'master'
              });
            }}
            onNewTab={handleNewTab}
            onCloseTab={handleCloseTab}
          />
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!isAuthenticated ? (
            <div className="h-full flex flex-col items-center justify-center p-6 relative">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 dark:from-cyan-500/5 dark:to-cyan-400/5 opacity-50" />
              
              {/* Content */}
              <div className="relative space-y-6 text-center max-w-sm">
                {/* Icon with glow effect */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-indigo-500/20 dark:bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 dark:from-cyan-500/10 dark:to-cyan-400/10 p-4 rounded-2xl">
                    <BrainIcon className="w-12 h-12 text-indigo-500 dark:text-cyan-500" />
                  </div>
                </div>
                
                {/* Main heading */}
                <div>
                  <h3 className="text-xl font-bold text-indigo-600 dark:text-cyan-300 mb-2">
                    Multi-Agent Chat Hub
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                    Connect with multiple AI models simultaneously
                  </p>
                  <p className="text-xs text-indigo-500/60 dark:text-cyan-400/60">
                    Compare responses, get diverse perspectives, all in one place
                  </p>
                </div>

                {/* Action button */}
                <button
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent('openSettings', { detail: { section: 'ai' } }));
                    trackEvent(ANALYTICS_EVENTS.WIDGET_INTERACT, {
                      action: 'open_ai_settings'
                    });
                  }}
                  className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-cyan-500 dark:to-cyan-400 text-white rounded-lg shadow-lg shadow-indigo-500/20 dark:shadow-cyan-500/20 hover:brightness-110 transition-all"
                >
                  <Key className="w-4 h-4" />
                  <span className="font-medium">Connect Your First Model</span>
                  <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Feature badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-2 py-1 text-xs bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 rounded-full">
                    Multiple Models
                  </span>
                  <span className="px-2 py-1 text-xs bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 rounded-full">
                    Parallel Chats
                  </span>
                  <span className="px-2 py-1 text-xs bg-indigo-50 dark:bg-cyan-500/10 text-indigo-600 dark:text-cyan-400 rounded-full">
                    Response Comparison
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {activeTabId === 'master' ? (
                <MasterChatHeader
                  tabs={tabs}
                  selectedTabs={selectedTabs}
                  onSelectedTabsChange={setSelectedTabs}
                />
              ) : (
                <ChatHeader
                  selectedKeyId={activeTab.apiKeyId}
                  onKeyChange={(keyId) => handleChangeApiKey(activeTabId, keyId)}
                />
              )}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain custom-scrollbar">
                {activeTab.messages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${message.error ? 'opacity-75' : ''}`}
                  >
                    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-indigo-500 dark:bg-cyan-500 text-white'
                        : message.error 
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-200 break-words' 
                          : 'bg-indigo-100 dark:bg-cyan-500/20 text-slate-800 dark:text-white break-words'
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
              <form onSubmit={handleSendMessage} className="p-4 border-t border-indigo-200 dark:border-cyan-500/20">
                <div className="flex gap-2">
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
                    className="flex-1 bg-white dark:bg-black/30 border border-indigo-200 dark:border-cyan-500/30 rounded-lg px-4 py-2 text-slate-800 dark:text-white placeholder:text-indigo-400 dark:placeholder:text-cyan-500/50 focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-cyan-500 dark:to-cyan-400 text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};