import fs from 'fs/promises';
import path from 'path';

type User = {
  name: string;
  birthYear: number;
};

export class UserService {
  private filePath: string;

  constructor() {
    this.filePath = path.resolve(process.cwd(), 'data/users.json');
  }

  private async loadUsers(): Promise<User[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as User[];
    } catch {
      return [];
    }
  }

  private async saveUsers(users: User[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(users, null, 2), 'utf-8');
  }

  async addUser(user: User): Promise<void> {
    const users = await this.loadUsers();
    users.push(user);
    await this.saveUsers(users);
  }

  async getUsers(): Promise<User[]> {
    return this.loadUsers();
  }

  async countUsersOlderThan(age: number): Promise<number> {
    const users = await this.loadUsers();
    const currentYear = new Date().getFullYear();
    return users.filter(user => currentYear - user.birthYear > age).length;
  }
}
