import type { ChatRequest, ChatResponse } from '../types';

// Use proxy in development to avoid CORS issues, direct URL in production
const WEBHOOK_URL = import.meta.env.MODE === 'development'
  ? '/api/webhook'
  : 'https://realsoftapps.com/n8n/webhook-test/DataDiscovery';

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const requestBody = {
      user_id: request.user_id || request.userId || 1,
      content: request.message || request.content || '',
      chat_id: request.chat_id || request.chatId || null,
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        
        if (errorData.message) {
          errorMessage = errorData.message;
          
          if (errorData.hint) {
            errorMessage += ` ${errorData.hint}`;
          }
          
          if (errorData.code === 404 && errorData.message.includes('not registered')) {
            errorMessage = `Webhook not registered: ${errorData.message}. ${errorData.hint || 'Please activate the n8n workflow first.'}`;
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch {
        const errorText = await response.text().catch(() => 'No error details available');
        if (errorText) {
          errorMessage += `. ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data[0] as ChatResponse;
    }
    
    return data as ChatResponse;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Failed to connect to ${WEBHOOK_URL}. This may be due to CORS restrictions or network connectivity. Original error: ${error.message}`);
    }
    throw error;
  }
}

