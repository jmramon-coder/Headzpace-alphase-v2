import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { initializeOpenAI, verifyApiKey } from '../utils/openai';
import type { APIKey } from '../types';

interface AIContextType {
  apiKeys: APIKey[];
  activeKey: APIKey | null;
  addApiKey: (name: string, key: string) => Promise<void>;
  removeApiKey: (id: string) => void;
  setActiveKey: (id: string) => void;
  validateKey: (key: string) => Promise<boolean>;
  isAuthenticated: boolean;
  error: string | null;
  setApiKey: (key: APIKey) => Promise<void>;
  apiKey: APIKey | null; // For backward compatibility
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(() => {
    try {
      const saved = localStorage.getItem('openai_api_keys');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse stored API keys:', e);
      return [];
    }
  });

  const [activeKey, setActiveKeyState] = useState<APIKey | null>(() => {
    try {
      const keys = JSON.parse(localStorage.getItem('openai_api_keys') || '[]');
      return keys.find((k: APIKey) => k.isActive) || (keys.length > 0 ? keys[0] : null);
    } catch (e) {
      console.error('Failed to parse stored active API key:', e);
      return null;
    }
  });

  const [error, setError] = useState<string | null>(null);

  // Persist API keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('openai_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Initialize OpenAI with the active key when it changes
  useEffect(() => {
    if (activeKey?.key) {
      try {
        initializeOpenAI(activeKey.key);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize OpenAI');
      }
    }
  }, [activeKey]);

  const validateKey = useCallback(async (key: string): Promise<boolean> => {
    // Clear previous errors
    setError(null);
    
    try {
      // Basic validation
      if (!key || !key.trim()) {
        throw new Error('API key is required');
      }
      
      if (!key.trim().startsWith('sk-')) {
        throw new Error('Invalid API key format. Key should start with "sk-"');
      }
      
      // Verify the key format (this no longer makes an API call)
      const isValid = await verifyApiKey(key.trim());
      if (!isValid) {
        throw new Error('API key validation failed. Please check your key format.');
      }
      
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'API key validation failed');
      return false;
    }
  }, []);

  const setApiKey = useCallback(async (newKey: APIKey): Promise<void> => {
    try {
      setError(null);
      
      // Validate the key format
      if (!newKey.key.trim().startsWith('sk-')) {
        throw new Error('Invalid API key format. Key should start with "sk-"');
      }
      
      // Verify the key (simplified check)
      const isValid = await verifyApiKey(newKey.key.trim());
      if (!isValid) {
        throw new Error('API key validation failed. Please check your key format.');
      }

      // Update API keys list
      setApiKeys(prev => {
        // Check if we already have this key
        const existingKeyIndex = prev.findIndex(k => k.key === newKey.key);
        
        if (existingKeyIndex >= 0) {
          // Update existing key
          const updatedKeys = [...prev];
          updatedKeys[existingKeyIndex] = {
            ...updatedKeys[existingKeyIndex],
            name: newKey.name,
            isActive: true
          };
          
          // Deactivate other keys
          return updatedKeys.map((k, idx) => ({
            ...k,
            isActive: idx === existingKeyIndex
          }));
        } else {
          // Add new key and make it active
          return prev.map(k => ({
            ...k,
            isActive: false
          })).concat({
            ...newKey,
            isActive: true
          });
        }
      });
      
      // Update active key
      setActiveKeyState(newKey);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add API key');
      throw error;
    }
  }, []);

  const addApiKey = useCallback(async (name: string, key: string) => {
    try {
      await setApiKey({
        id: crypto.randomUUID(),
        name: name.trim() || 'Default Key',
        key: key.trim(),
        isActive: true,
        createdAt: Date.now()
      });
    } catch (error) {
      throw error;
    }
  }, [setApiKey]);

  const handleSetActiveKey = useCallback((id: string) => {
    setApiKeys(prev => prev.map(key => ({
      ...key,
      isActive: key.id === id
    })));

    const newActiveKey = apiKeys.find(k => k.id === id) || null;
    setActiveKeyState(newActiveKey);
  }, [apiKeys]);

  const handleRemoveApiKey = useCallback((id: string) => {
    const isRemovingActive = activeKey?.id === id;
    
    setApiKeys(prev => {
      const filtered = prev.filter(key => key.id !== id);
      
      // If removing active key, make another key active if available
      if (isRemovingActive && filtered.length > 0) {
        filtered[0].isActive = true;
      }
      
      return filtered;
    });
    
    if (isRemovingActive) {
      setActiveKeyState(apiKeys.filter(k => k.id !== id)[0] || null);
    }
  }, [apiKeys, activeKey?.id]);

  return (
    <AIContext.Provider value={{
      apiKeys,
      activeKey,
      apiKey: activeKey, // For backward compatibility
      addApiKey,
      setApiKey,
      removeApiKey: handleRemoveApiKey,
      setActiveKey: handleSetActiveKey,
      validateKey,
      isAuthenticated: !!activeKey,
      error
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}