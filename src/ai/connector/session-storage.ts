export class SessionStorage<T> {
  private sessions: Record<string, T> = {};

  constructor(private readonly initSession: () => T) {}

  get(sessionId: string): T {
    if (!this.sessions[sessionId]) {
      this.sessions[sessionId] = this.initSession();
    }
    return this.sessions[sessionId];
  }

  set(sessionId: string, messages: T) {
    this.sessions[sessionId] = messages;
  }

  reset(sessionId: string) {
    delete this.sessions[sessionId];
  }

  has(sessionId: string): boolean {
    return sessionId in this.sessions;
  }
}
