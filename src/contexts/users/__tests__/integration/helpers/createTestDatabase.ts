import { PgPromiseAdapter } from "@shared/infra/database/adapters/PgPromiseAdapter";
import pgPromise from "pg-promise";

const pgp = pgPromise();

const TEST_DATABASE_URL = "postgresql://test:test@localhost:5433/test_db";

export type TestDatabase = {
  db: PgPromiseAdapter;
  teardown: () => Promise<void>;
};

export async function createTestDatabase(): Promise<TestDatabase> {
  const pgConnection = pgp(TEST_DATABASE_URL);
  const db = new PgPromiseAdapter(pgConnection);

  const teardown = async (): Promise<void> => {
    await pgConnection.$pool.end();
  };

  return { db, teardown };
}

export async function clearUsers(db: PgPromiseAdapter): Promise<void> {
  await db.none("TRUNCATE TABLE users CASCADE");
}
