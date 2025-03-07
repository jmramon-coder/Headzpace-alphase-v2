export interface ChatProvider {
  baseURL: string;
  headers: (apiKey: string) => Record<string, string>;
}

export const CHAT_PROVIDERS: Record<string, ChatProvider> = {
  default: {
    baseURL: 'https://api.openai.com/v1',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`
    })
  }
};