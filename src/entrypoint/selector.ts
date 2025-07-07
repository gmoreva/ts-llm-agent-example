import { AiEntryPointInterface } from './interface';
import { CliEntryPoint } from './cli';
import { TelegramEntryPoint } from './telegram';
import { ChatProcessor } from '../ai/chat-processor';

export function selectEntrypoint(): AiEntryPointInterface {
  const args = process.argv.slice(2);
  const processor = new ChatProcessor();
  if (args.includes('--cli')) {
    return new CliEntryPoint(processor);
  } else if (args.includes('--telegram')) {
    return new TelegramEntryPoint();
  } else {
    throw new Error('Usage: node dist/index.js --cli | --telegram');
  }
}