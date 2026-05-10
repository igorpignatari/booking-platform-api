export interface Database {
  query<T = any>(sql: string, params?: unknown[]): Promise<T[]>;
  one<T = any>(sql: string, params?: unknown[]): Promise<T>;
  none(sql: string, params?: unknown[]): Promise<void>;
  oneOrNone<T = any>(sql: string, params?: unknown[]): Promise<T | null>;
  manyOrNone<T = any>(sql: string, params?: unknown[]): Promise<T[]>;
  tx<T>(work: (trx: Database) => Promise<T>): Promise<T>;
}
