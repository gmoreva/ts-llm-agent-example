import { AIHelperInterface } from './interface';
import { OpenAIHelper } from './openai';

const systemPrompt = "";

export class AIHelperProvider {
  static getAiProvider(type: 'openai' | 'gigachat' | 'ollama'): AIHelperInterface {
    switch (type) {
      case "openai":
        const openaiApiKey = process.env.OPENAI_API_KEY || '';
        const tools = process.env.OPENAI_MODEL_TOOLS || 'gpt-4.1-mini';
        const talk = process.env.OPENAI_MODEL_TALK || 'gpt-4.1-nano';
        return new OpenAIHelper(openaiApiKey, {
          tools,
          talk
        }, systemPrompt);
    }
    throw new Error(`AI provider ${type} not supported`);
  }

}