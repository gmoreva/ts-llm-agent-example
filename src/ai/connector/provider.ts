import { AIHelperInterface } from './interface';
import { OpenAIHelper } from './openai';
import { GigachatAIHelper } from './gigachat';

const systemPrompt = "";

export enum AIProvider {
  OPENAI = 'openai',
  GIGACHAT = 'gigachat',
  OLLAMA = 'ollama'
}

export class AIHelperProvider {
  static getAiProvider(type: AIProvider): AIHelperInterface {
    switch (type) {
      case "openai":
        const openaiApiKey = process.env.OPENAI_API_KEY || '';
        const tools = process.env.OPENAI_MODEL_TOOLS || 'gpt-4.1-mini';
        const talk = process.env.OPENAI_MODEL_TALK || 'gpt-4.1-nano';
        return new OpenAIHelper(openaiApiKey, {
          tools,
          talk
        }, systemPrompt);
      case "gigachat":
        return new GigachatAIHelper({
          clientId: process.env.GIGACHAT_CLIENT_ID || '',
          clientSecret: process.env.GIGACHAT_CLIENT_SECRET || '',
          scope: process.env.GIGACHAT_CLIENT_SCOPE || '',
        }, {
          talk: process.env.GIGACHAT_MODEL_TALK || 'GigaChat',
          tools: process.env.GIGACHAT_MODEL_TOOLS || 'GigaChat',
        }, systemPrompt);
        break;
    }
    throw new Error(`AI provider ${type} not supported`);
  }

}