import { OpenAI } from 'openai';

const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;
const ERROR_CODES = {
  INSUFFICIENT_QUOTA: 'insufficient_quota',
  INVALID_API_KEY: 'invalid_api_key',
  INVALID_REQUEST: 'invalid_request_error',
  RATE_LIMIT: 'rate_limit_exceeded'
};

const ERROR_MESSAGES = {
  INVALID_KEY: 'Invalid API key format. Please ensure your key begins with "sk-".',
  NO_KEY: 'No API key provided. Please add your OpenAI API key in the settings.',
  NO_INSTANCE: 'OpenAI client not initialized. Please check your API key.',
  QUOTA_EXCEEDED: 'Your OpenAI API quota has been exceeded. Please check your billing details.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  INVALID_REQUEST: 'The request was invalid. Please try with different input.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN: 'An unknown error occurred. Please try again.'
};

interface OpenAIError extends Error {
  code?: string;
  status?: number;
  type?: string;
}

let openaiInstance: OpenAI | null = null;
let currentKey: string | null = null;

export const initializeOpenAI = (apiKey: string, force = false): OpenAI => {
  // Don't reinitialize if using same key
  if (!force && currentKey === apiKey && openaiInstance) {
    return openaiInstance;
  }

  if (!apiKey?.trim()) {
    throw new Error(ERROR_MESSAGES.NO_KEY);
  }

  if (!apiKey.startsWith('sk-')) {
    throw new Error(ERROR_MESSAGES.INVALID_KEY);
  }

  // Create new instance
  openaiInstance = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
    timeout: API_TIMEOUT,
    maxRetries: MAX_RETRIES
  });

  currentKey = apiKey;
  return openaiInstance;
};

export const getOpenAIInstance = (): OpenAI => {
  if (!openaiInstance) {
    throw new Error(ERROR_MESSAGES.NO_INSTANCE);
  }
  return openaiInstance;
};

export const handleOpenAIError = (error: unknown): string => {
  const err = error as OpenAIError;
  
  // Check specific error codes
  if (err.code === ERROR_CODES.INSUFFICIENT_QUOTA) {
    return ERROR_MESSAGES.QUOTA_EXCEEDED;
  }
  
  if (err.code === ERROR_CODES.RATE_LIMIT || err.status === 429) {
    return ERROR_MESSAGES.RATE_LIMITED;
  }
  
  if (err.code === ERROR_CODES.INVALID_API_KEY) {
    return ERROR_MESSAGES.INVALID_KEY;
  }

  if (err.type === ERROR_CODES.INVALID_REQUEST) {
    return ERROR_MESSAGES.INVALID_REQUEST;
  }
  
  // Check for network errors
  if (err.message?.includes('network') || err.message?.includes('timeout')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  return err.message || ERROR_MESSAGES.UNKNOWN;
};

// Modified to simplify validation by just checking the format without making an API call
export const verifyApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Basic format validation
    if (!apiKey || typeof apiKey !== 'string') {
      console.error('API key validation failed: Key is empty or not a string');
      return false;
    }
    
    if (!apiKey.trim().startsWith('sk-')) {
      console.error('API key validation failed: Key does not start with sk-');
      return false;
    }
    
    // Check for minimum length (typical OpenAI keys are quite long)
    if (apiKey.length < 30) {
      console.error('API key validation failed: Key is too short');
      return false;
    }
    
    // We'll assume the key is valid if it meets the format criteria
    // This avoids CORS issues and unnecessary API calls
    return true;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
};