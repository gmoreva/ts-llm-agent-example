import { AiEntryPointInterface } from './interface';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { ChatProcessor } from '../ai/chat-processor';

export class CliEntryPoint implements AiEntryPointInterface{
  constructor(
    private readonly processor: ChatProcessor,
  ) {
  }

  async run() {
    const SESSION_ID = 'cli-session';
    console.log("CLI mode started");
    // Здесь будет логика CLI
    const rl = readline.createInterface({input, output});
    while (true) {
      const query = await rl.question('\n🗣️  Ваш запрос: ');
      if (query.trim().toLowerCase() === 'exit') {
        console.log('👋 До свидания!');
        rl.close();
        process.exit(0);
      }
      const start = Date.now();
      console.log('🤖 Думаю...');

      const response = await this.processor.processMessage(SESSION_ID, query);
      const end = Date.now();
      const durationSec = ((end - start) / 1000).toFixed(2);

      console.log(`\n🤖 AI (${durationSec} сек):\n${response.message}`);
      if (response.tools.length > 0) {
        console.log(`🛠️  Использованные инструменты:`);
        response.tools.forEach((tool, i) => {
          console.log(`  ${i + 1}. ${tool.name} ${JSON.stringify(tool.arguments)}`);
        });
      }
    }
  }
}