import { AiEntryPointInterface } from './interface';
import { CliEntryPoint } from './cli';
import { TelegramEntryPoint } from './telegram';
import { ChatProcessor } from '../ai/chat-processor';

export async function selectEntrypoint(): Promise<AiEntryPointInterface> {
  const args = process.argv.slice(2);
  const processor = new ChatProcessor();
  await processor.init();
  if (args.includes('--cli')) {
    return new CliEntryPoint(processor);
  } else if (args.includes('--telegram')) {
    return new TelegramEntryPoint(processor);
  } else {
    throw new Error('Usage: node dist/index.js --cli | --telegram');
  }
}