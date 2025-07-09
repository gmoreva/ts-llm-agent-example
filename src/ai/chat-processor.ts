import { AIHelperProvider } from './connector/provider';
import { AIHelperInterface } from './connector/interface';

export class ChatProcessor {
  ai: AIHelperInterface;

  constructor() {
    this.ai = AIHelperProvider.getAiProvider('openai');
  }

  async processMessage(sessionId: string, text: string): Promise<{
    message: string;
    tools: { name: string; arguments: Record<string, unknown> }[];
  }> {
    // Пока просто передаем в текстовый режим для теста
    const result = await this.ai.simpleChat(sessionId, text);
    return {
      message: result,
      tools: [],
    };
  }
}
