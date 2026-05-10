import type { Database } from "@shared/application/contracts/Database";
import type { IDatabase, ITask } from "pg-promise";

type PgConnection = IDatabase<unknown> | ITask<unknown>;

export class PgPromiseAdapter implements Database {
  constructor(private readonly connection: PgConnection) {}

  query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    return this.connection.query(sql, params);
  }

  one<T>(sql: string, params?: unknown[]): Promise<T> {
    return this.connection.one(sql, params);
  }

  oneOrNone<T>(sql: string, params?: unknown[]): Promise<T | null> {
    return this.connection.oneOrNone(sql, params);
  }

  manyOrNone<T = any>(sql: string, params?: unknown[]): Promise<T[]> {
    return this.connection.manyOrNone(sql, params);
  }

  async none(sql: string, params?: unknown[]): Promise<void> {
    await this.connection.none(sql, params);
  }

  async disconnect(): Promise<void> {
    if ("$pool" in this.connection) {
      await this.connection.$pool.end();
    }
  }

  tx<T>(work: (trx: Database) => Promise<T>): Promise<T> {
    if ("tx" in this.connection) {
      return this.connection.tx(async (t) => {
        const trxAdapter = new PgPromiseAdapter(t);
        return work(trxAdapter);
      });
    }
    return work(this);
  }
}
