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

export async function clearAuth(db: PgPromiseAdapter): Promise<void> {
  await db.none("TRUNCATE TABLE auth CASCADE");
}

export async function clearAll(db: PgPromiseAdapter): Promise<void> {
  await db.none("TRUNCATE TABLE auth, users CASCADE");
}

/**
 * Seeds a user row directly — avoids depending on CreateUserUseCase
 * in auth integration tests.
 */
export async function seedUser(
  db: PgPromiseAdapter,
  overrides?: Partial<{
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
  }>,
): Promise<{ id: string; email: string; password: string }> {
  const user = {
    id: overrides?.id ?? crypto.randomUUID(),
    name: overrides?.name ?? "Test User",
    email: overrides?.email ?? "test@example.com",
    password: overrides?.password ?? "hashed_password",
    phone: overrides?.phone ?? "11999990000",
    role: overrides?.role ?? "user",
  };

  await db.none(
    "INSERT INTO users (id, name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5, $6)",
    [user.id, user.name, user.email, user.password, user.phone, user.role],
  );

  return { id: user.id, email: user.email, password: user.password };
}
