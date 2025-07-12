import { AIHelperInterface, SingleToolRequest, ToolCallRequest, ToolCallResult, ToolDescriptor } from './interface';
import GigaChat from 'gigachat';
import { Agent } from 'node:https';
import { SessionStorage } from './session-storage';
import { Message } from 'gigachat/src/interfaces/message';
import { Buffer } from 'buffer';

type Session = {
  messages: Message[];
}

export class GigachatAIHelper implements AIHelperInterface {
  protected session: SessionStorage<Session> = new SessionStorage<Session>(() => ({
    messages: this.systemPrompt
      ? [{
        role: 'system',
        content: this.systemPrompt,
      }]
      : [],
    toolResult: {},
  }));

  private client: GigaChat;

  constructor(
    private readonly auth: {
      clientId: string,
      clientSecret: string,
      scope: string,
    },
    private readonly models: {
      tools: string,
      talk: string,
    },
    private readonly systemPrompt: string
  ) {
    if (!this.auth.clientSecret) {
      throw new Error("No Gigachat secret provided");
    }
    if (!this.auth.clientId) {
      throw new Error("No Gigachat clientId provided");
    }
    if (!this.auth.scope) {
      throw new Error("No Gigachat scope provided");
    }
    const httpsAgent = new Agent({
      rejectUnauthorized: false, // Отключает проверку корневого сертификата
      // Читайте ниже как можно включить проверку сертификата Мин. Цифры
    });

    this.client = new GigaChat({
      timeout: 600,
      model: 'GigaChat',
      credentials: this.credentials,
      httpsAgent: httpsAgent,
      scope: this.auth.scope,
    });
  }

  private get credentials(): string {
    return `${Buffer.from(
      `${this.auth.clientId}:${this.auth.clientSecret}`,
      'utf-8',
    ).toString('base64')}`;
  }

  async chatWithTools(sessionId: string, message: string, tools: ToolDescriptor[]): Promise<ToolCallRequest> {
    const session = this.session.get(sessionId);

    // Добавляем сообщение пользователя в историю
    session.messages.push({
      role: 'user',
      content: message,
    });
    const functions = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }));

    const response = await this.client.chat({
      messages: session.messages,
      functions,
      function_call: 'auto',
      model: this.models.tools,
    });

    const choice = response.choices[0];
    session.messages.push(choice.message);
    const funcCall = choice.message.function_call;
    const toolCalls: SingleToolRequest[] = [];
    if (funcCall) {
      toolCalls.push({
        id: choice.message.functions_state_id,
        name: funcCall.name,
        arguments: funcCall.arguments as any
      });
    }

    return {
      message: choice.message.content!,
      toolCalls: toolCalls
    };
  }

  async storeToolResult(sessionId: string, result: ToolCallResult): Promise<void> {
    const session = this.session.get(sessionId);
    const message = session.messages.find(m => m.functions_state_id === result.request.id);
    let content = JSON.stringify(result.structuredContent || result.content || {});
    if (message) {
      message.content = content;
    }
    session.messages.push({
      role: 'function',
      content,
      name: result.request.name
    });
  }

  async simpleChat(sessionId: string, message: string): Promise<string> {
    const session = this.session.get(sessionId);
    session.messages.push({
      role: 'user',
      content: message,
    })
    const response = await this.client.chat({
      messages: session.messages,
      function_call: 'auto',
      model: this.models.talk,
    });
    if (response.choices[0].message) {
      session.messages.push(response.choices[0].message);
    }

    return response.choices[0].message.content || '';
  }

  async resetSession(sessionId: string): Promise<void> {
    this.session.reset(sessionId);
  }
}