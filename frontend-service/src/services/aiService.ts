import { apiFetch } from './api';

export const aiService = {
  async sendMessage(message: string): Promise<{ response: string }> {
    return apiFetch<{ response: string }>('/api/chatbot', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
};
