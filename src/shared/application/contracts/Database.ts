export interface Database {
  query<T = any>(query: string, params?: any[]): Promise<T[]>;
  one<T = any>(query: string, params?: any[]): Promise<T>;
  none(query: string, params?: any[]): Promise<void>;
  oneOrNone<T = any>(query: string, params?: any[]): Promise<T | null>;
}
