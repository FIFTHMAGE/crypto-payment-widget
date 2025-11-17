/** Database Abstraction Layer */
export interface IDatabase {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
}
export class PostgresAdapter implements IDatabase {
  async query<T>(sql: string, params?: any[]): Promise<T[]> { return []; }
  async execute(sql: string, params?: any[]): Promise<void> {}
}

