import type { Database } from "@shared/application/contracts/Database";
import type { IDatabase, ITask } from "pg-promise";
import { DB_CONNECTION } from "../connections/PgPromiseConnection";

export class PgPromiseAdapter implements Database {
  constructor(private readonly connection: IDatabase<any> | ITask<any> = DB_CONNECTION) {}

  async query<T = any>(query: string, params?: any[]): Promise<T[]> {
    return this.connection.query(query, params);
  }
  async one<T = any>(query: string, params?: any[]): Promise<T> {
    return this.connection.one(query, params);
  }
  async none(query: string, params?: any[]): Promise<any> {
    return this.connection.none(query, params);
  }
  async oneOrNone<T = any>(query: string, params?: any[]): Promise<T | null> {
    return this.connection.oneOrNone(query, params);
  }
}
