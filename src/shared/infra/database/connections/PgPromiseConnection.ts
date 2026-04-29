import pgPromise, { type IDatabase } from "pg-promise";

export const pgp = pgPromise();

let connection: IDatabase<unknown> | null = null;

export function getDbConnection(databaseUrl: string): IDatabase<unknown> {
  if (!connection) {
    connection = pgp(databaseUrl);
  }
  return connection;
}

export async function closeDbConnection(): Promise<void> {
  if (connection) {
    await connection.$pool.end();
    connection = null;
  }
}
