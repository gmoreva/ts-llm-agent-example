export interface ToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export type SingleToolRequest = { id?: string; name: string; arguments: Record<string, unknown> };

export interface ToolCallRequest {
  message: string;
  toolCalls?: SingleToolRequest[];
}

export interface ToolCallResult {
  request: SingleToolRequest
  content: string;
  structuredContent: any;
}

export interface AIHelperInterface {
  // Обработка запроса с возможными инструментами обработки
  chatWithTools(sessionId: string, message: string, tools: ToolDescriptor[]): Promise<ToolCallRequest>;

  // Сохранение результата вызова инструмента, чтобы передать в истории
  storeToolResult(sessionId: string, result: ToolCallResult): Promise<void>;

  // Отправка обычного текстового запроса в ИИ. Можно использовать модель проще, т.к. надо просто красиво ответить
  simpleChat(sessionId: string, message: string): Promise<string>;

  // Сброс сессии. Уместно для Telegram по ChatId
  resetSession(sessionId: string): Promise<void>;
}
