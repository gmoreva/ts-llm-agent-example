import { AiEntryPointInterface } from './interface';
import { CliEntryPoint } from './cli';
import { TelegramEntryPoint } from './telegram';

export function selectEntrypoint(): AiEntryPointInterface {
  const args = process.argv.slice(2);
  if (args.includes('--cli')) {
    return new CliEntryPoint();
  } else if (args.includes('--telegram')) {
    return new TelegramEntryPoint();
  } else {
    throw new Error('Usage: node dist/index.js --cli | --telegram');
  }
}