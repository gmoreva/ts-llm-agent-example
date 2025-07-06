export interface AiEntryPointInterface {
  run(): Promise<void> | void;
}