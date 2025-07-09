import { AIHelperProvider } from './connector/provider';
import { AIHelperInterface, ToolDescriptor } from './connector/interface';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class ChatProcessor {
  ai: AIHelperInterface;
  private mcp: Client;
  private transport: StdioClientTransport;
  private tools: ToolDescriptor[] = [];

  constructor() {
    this.ai = AIHelperProvider.getAiProvider('openai');
    this.mcp = new Client({name: 'mcp-client-cli', version: '1.0.0'});
    this.transport = new StdioClientTransport({command: 'node dist/mcp/index.js'});
  }

  async init() {
    this.mcp.connect(this.transport);
    this.tools = (await this.mcp.listTools()).tools as ToolDescriptor[];
  }

  async processMessage(sessionId: string, text: string): Promise<{
    message: string;
    tools: { name: string; arguments: Record<string, unknown> }[];
  }> {
    const toolsUsed: { name: string; arguments: Record<string, unknown> }[] = [];
    const finalOutput: string[] = [];

    const response = await this.ai.chatWithTools(sessionId, text, this.tools);
    if (response.toolCalls && response.toolCalls.length > 0) {
      for (const call of response.toolCalls) {
        // Сохраняем для статистики
        toolsUsed.push(call);

        const result = await this.mcp.callTool({
          name: call.name,
          arguments: call.arguments,
        });

        const arrayResult = result.content as any[];
        const flattened = arrayResult
          .map((item) => (item.type === 'text' ? item.text : item.resource?.data || ''))
          .join('\n\n');
        // Сохраняем результат для истории с LLM
        await this.ai.storeToolResult(sessionId, {
          request: call,
          content: flattened,
          structuredContent: result.structuredContent,
        });
      }
      const reply = await this.ai.simpleChat(sessionId, 'Напиши мне ответ на основе результата выполнения функций, который можно было бы сразу отправить тому, кто запрашивал');
      finalOutput.push(reply);
    } else {
      finalOutput.push(response.message);
    }

    return {
      message: finalOutput.join('\n'),
      tools: toolsUsed,
    };
  }
}
