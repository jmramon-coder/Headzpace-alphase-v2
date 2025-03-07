import { useState, useCallback, useEffect } from 'react';
import { initializeOpenAI, getOpenAIInstance, handleOpenAIError } from '../utils/openai';
import type { ChatMessage } from '../types/chat';

interface UseChatOptions {
  apiKey?: string;
  onError?: (error: unknown) => void;
}

export function useChat({ apiKey, onError }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset messages when API key changes
  useEffect(() => {
    setMessages([]);
    if (apiKey) {
      setMessages([{
        role: 'assistant',
        content: 'Hello! How can I help you today?'
      }]);
    }
  }, [apiKey]);

  const sendMessage = useCallback(async (content: string) => {
    if (!apiKey) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Please provide an OpenAI API key to continue.',
        error: true
      }]);
      return;
    }

    if (!content.trim()) return;

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsLoading(true);

    try {
      // Initialize OpenAI with current key
      initializeOpenAI(apiKey);
      const openai = getOpenAIInstance();
      
      const completion = await openai.chat.completions.create({
        messages: [...messages, { role: 'user', content }].map(msg => ({
          role: msg.role as any,
          content: msg.content
        })),
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response
        }]);
      }
    } catch (error) {
      const errorMessage = handleOpenAIError(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        error: true
      }]);
      
      // Call external error handler if provided
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, messages, onError]);

  return {
    messages,
    isLoading,
    sendMessage
  };
}