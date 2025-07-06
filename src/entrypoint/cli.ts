import { AiEntryPointInterface } from './interface';

export class CliEntryPoint implements AiEntryPointInterface{
  run() {
    console.log("CLI mode started");
    // Здесь будет логика CLI
  }
}