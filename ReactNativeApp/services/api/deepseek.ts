/**
 * DeepSeek AI API Client
 * Handles communication with DeepSeek API for music recommendations and chat
 */

import { env } from '@/config/env';
import { Message } from '@/types';
import {
  DeepSeekMessage,
  DeepSeekResponse,
  DeepSeekIntent,
  DeepSeekError,
  ApiError,
} from '@/types/api';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const SYSTEM_PROMPT = `You are a friendly AI music recommendation assistant. Help users discover music based on their mood, activity, and preferences. Be conversational and enthusiastic about music.

When recommending songs:
1. Consider the user's mood, activity, and music taste
2. Provide diverse recommendations (mix of popular and deep cuts)
3. Explain why each song fits their request
4. Be conversational and engaging

You can understand requests like:
- "I'm feeling sad, recommend some music"
- "What should I listen to while working out?"
- "Songs like [artist/song]"
- "Chill music for studying"`;

export class DeepSeekClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.deepseekApiKey;
    this.baseURL = DEEPSEEK_API_URL;

    if (this.apiKey === 'dev_placeholder') {
      console.warn('⚠️  DeepSeek API key not configured. Using mock responses.');
    }
  }

  /**
   * Sends a message to DeepSeek API with conversation history
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: Message[] = []
  ): Promise<string> {
    // Return mock response if API key not configured
    if (this.apiKey === 'dev_placeholder') {
      return this.getMockResponse(userMessage);
    }

    const messages = this.formatMessages(userMessage, conversationHistory);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (env.isDevelopment) {
          console.log(`🤖 DeepSeek API Request (Attempt ${attempt}/${MAX_RETRIES}):`, {
            messageCount: messages.length,
            userMessage: userMessage.substring(0, 100),
          });
        }

        const response = await this.makeRequest<DeepSeekResponse>(messages, REQUEST_TIMEOUT);
        
        const aiMessage = response.choices[0]?.message?.content;
        
        if (!aiMessage) {
          throw new Error('Empty response from DeepSeek API');
        }

        if (env.isDevelopment) {
          console.log('✅ DeepSeek API Response:', {
            tokens: response.usage.total_tokens,
            preview: aiMessage.substring(0, 100),
          });
        }

        return aiMessage;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          throw this.handleError(error);
        }
        
        // Wait before retrying
        await this.delay(RETRY_DELAY * attempt);
      }
    }

    throw new Error('Failed to get response from DeepSeek API after retries');
  }

  /**
   * Extracts user intent from message using DeepSeek
   */
  async extractIntent(userMessage: string): Promise<DeepSeekIntent> {
    // Return mock intent if API key not configured
    if (this.apiKey === 'dev_placeholder') {
      return this.getMockIntent(userMessage);
    }

    const intentPrompt = `Extract the music intent from this user message. Return ONLY a JSON object with these optional fields: mood, genre, artist, activity, query.

User message: "${userMessage}"

JSON:`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: 'You are a JSON-only response bot. Output valid JSON only.' },
      { role: 'user', content: intentPrompt },
    ];

    try {
      if (env.isDevelopment) {
        console.log('🎯 Extracting intent from:', userMessage);
      }

      const response = await this.makeRequest<DeepSeekResponse>(messages, REQUEST_TIMEOUT);
      const content = response.choices[0]?.message?.content || '{}';
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[^}]+\}/);
      const intent: DeepSeekIntent = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      if (env.isDevelopment) {
        console.log('✅ Extracted intent:', intent);
      }

      return intent;
    } catch (error) {
      console.error('Failed to extract intent:', error);
      return {};
    }
  }

  /**
   * Formats conversation history for DeepSeek API
   */
  private formatMessages(
    userMessage: string,
    conversationHistory: Message[]
  ): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history (last 10 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  /**
   * Makes API request with timeout
   */
  private async makeRequest<T>(
    messages: DeepSeekMessage[],
    timeout: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: DeepSeekError = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - DeepSeek API took too long to respond');
      }
      
      throw error;
    }
  }

  /**
   * Handles and formats errors
   */
  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'DEEPSEEK_ERROR',
      };
    }

    return {
      message: 'Unknown error communicating with DeepSeek API',
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Delays execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Returns mock response for development
   */
  private getMockResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('sad') || lowerMessage.includes('down')) {
      return "I understand you're feeling down. Music can really help with that! Here are some recommendations:\n\n✨ Highlight Pick: 'Weightless' by Marconi Union - scientifically proven to reduce anxiety by 65%\n\n🎵 Deep Cuts:\n- 'Holocene' by Bon Iver\n- 'The Night We Met' by Lord Huron\n\nLet me know if you'd like more suggestions!";
    }

    if (lowerMessage.includes('workout') || lowerMessage.includes('gym')) {
      return "Let's get you pumped up for that workout! 🔥\n\n✨ Highlight Pick: 'Eye of the Tiger' by Survivor - the ultimate workout anthem\n\n🔥 Mainstream Picks:\n- 'Stronger' by Kanye West\n- 'Till I Collapse' by Eminem\n\nThese will keep your energy up!";
    }

    return "Great to hear from you! I'd love to recommend some music. Could you tell me more about:\n- Your current mood\n- What activity you're doing\n- Your favorite genres or artists\n\nThis will help me find the perfect songs for you! 🎵";
  }

  /**
   * Returns mock intent for development
   */
  private getMockIntent(userMessage: string): DeepSeekIntent {
    const lowerMessage = userMessage.toLowerCase();
    const intent: DeepSeekIntent = { query: userMessage };

    if (lowerMessage.includes('sad') || lowerMessage.includes('down')) {
      intent.mood = 'sad';
    }
    if (lowerMessage.includes('happy') || lowerMessage.includes('upbeat')) {
      intent.mood = 'happy';
    }
    if (lowerMessage.includes('chill') || lowerMessage.includes('relax')) {
      intent.mood = 'chill';
    }
    if (lowerMessage.includes('workout') || lowerMessage.includes('gym')) {
      intent.activity = 'workout';
    }
    if (lowerMessage.includes('study') || lowerMessage.includes('work')) {
      intent.activity = 'focus';
    }

    // Extract genre mentions
    const genres = ['rock', 'pop', 'hip hop', 'electronic', 'indie', 'jazz', 'classical'];
    for (const genre of genres) {
      if (lowerMessage.includes(genre)) {
        intent.genre = genre;
        break;
      }
    }

    return intent;
  }
}

// Export singleton instance
export const deepseekClient = new DeepSeekClient();
