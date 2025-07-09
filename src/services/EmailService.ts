import fs from 'fs/promises';
import path from 'path';

type EmailEntry = {
  id: string;
  text: string;
  timestamp: string;
};

export class EmailService {
  private filePath: string;

  constructor() {
    this.filePath = path.resolve(process.cwd(), 'data/emails.json');
  }

  private async loadEmails(): Promise<EmailEntry[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as EmailEntry[];
    } catch {
      return [];
    }
  }

  private async saveEmails(emails: EmailEntry[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(emails, null, 2), 'utf-8');
  }

  async saveEmail(text: string): Promise<void> {
    const emails = await this.loadEmails();
    const newEntry: EmailEntry = {
      id: crypto.randomUUID(),
      text,
      timestamp: new Date().toISOString()
    };
    emails.push(newEntry);
    await this.saveEmails(emails);
  }
}
