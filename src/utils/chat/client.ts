import { initializeOpenAI, getOpenAIInstance } from '../openai';

export class ChatClient {
  private apiKey: string;
  private messageHistory: { role: 'user' | 'assistant', content: string }[];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.messageHistory = [];
    // Initialize OpenAI with the key
    initializeOpenAI(apiKey);
  }

  async chat(message: string): Promise<string> {
    try {
      // Add user message to history
      this.messageHistory.push({ role: 'user', content: message });

      const openai = getOpenAIInstance();
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.messageHistory,
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content || 'No response received';
      
      // Add assistant response to history
      this.messageHistory.push({ role: 'assistant', content: response });
      
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  clearHistory() {
    this.messageHistory = [];
  }
}