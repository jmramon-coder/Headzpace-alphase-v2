export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

export interface ChatConfig {
  apiKey: string;
  baseURL?: string;
}