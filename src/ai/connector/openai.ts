import { AIHelperInterface, ToolCallRequest, ToolCallResult, ToolDescriptor } from './interface';
import { OpenAI } from 'openai';
import { SessionStorage } from './session-storage';
import { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

interface Session {
  messages: ChatCompletionMessageParam[] | any;
  toolResult: Record<string, any>;
}

export class OpenAIHelper implements AIHelperInterface {
  /*
  Объявляем сессию и задаем колбек для создания
  массива сообщений с system prompt в первом элементе
   */
  protected session: SessionStorage<Session> = new SessionStorage<Session>(() => ({
    messages: this.systemPrompt
      ? [{
        role: 'system',
        content: [{
          type: 'text',
          text: this.systemPrompt,
        }],
      }]
      : [],
    toolResult: {},
  }));

  // Коннектор к OpenAI
  private openai: OpenAI;

  constructor(
    apiKey: string,
    private readonly models: { tools: string; talk: string },
    private readonly systemPrompt: string,
  ) {
    this.openai = new OpenAI({apiKey});
  }

  async chatWithTools(sessionId: string, message: string, tools: ToolDescriptor[]): Promise<ToolCallRequest> {
    const session = this.session.get(sessionId);

    // Преобразуем описание инструментов в формат OpenAI
    const openaiTools: ChatCompletionTool[] = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));

    // Добавляем сообщение пользователя с запросом
    session.messages.push({
      role: 'user',
      content: [{
        type: 'text',
        text: message,
      }],
    });

    const response = await this.openai.chat.completions.create({
      model: this.models.tools,
      messages: session.messages,
      tools: openaiTools,
      tool_choice: 'auto',
    });

    const toolCalls = response.choices[0].message.tool_calls || [];
    session.messages.push(response.choices[0].message);
    return {
      message: response.choices[0].message.content ?? '',
      toolCalls: toolCalls.map(tc => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments || '{}'),
      })),
    };
  }

  async resetSession(sessionId: string): Promise<void> {
    this.session.reset(sessionId);
  }

  async simpleChat(sessionId: string, message: string): Promise<string> {
    const session = this.session.get(sessionId);
    session.messages.push({
      role: 'user',
      content: [{
        type: 'text',
        text: message,
      }],
    });
    const response = await this.openai.chat.completions.create({
      model: this.models.talk,
      messages: session.messages,
    });

    return response.choices[0].message.content ?? '';
  }

  async storeToolResult(sessionId: string, result: ToolCallResult): Promise<void> {
    if (!result.request.id) {
      console.warn(
        'Tool call result does not have an id. This is likely a bug.',
        result,
      );
      return;
    }
    this.session.get(sessionId).messages.push({
      role: 'tool',
      tool_call_id: result.request.id,
      content: result.content,
    });
    if (result.structuredContent)
      this.session.get(sessionId).toolResult[result.request.id] = result.structuredContent;
  }
}