import { makeDependencies } from "@main/dependencies";
import { registerAuthRoutes } from "@main/routes/auth/authRoutes";
import { registerUsersRoutes } from "@main/routes/users/usersRoutes";
import type { PgPromiseAdapter } from "@shared/infra/database/adapters/PgPromiseAdapter";
import { closeDbConnection } from "@shared/infra/database/connections/PgPromiseConnection";
import { HttpFastifyAdapter } from "@shared/infra/http/adapters/fastify/HttpFastifyAdapter";

export type TestApp = {
  http: HttpFastifyAdapter;
  db: PgPromiseAdapter;
  teardown: () => Promise<void>;
};

export async function createTestApp(): Promise<TestApp> {
  const deps = makeDependencies();

  const http = new HttpFastifyAdapter();
  registerUsersRoutes(http, deps);
  registerAuthRoutes(http, deps);
  await http.ready();

  const teardown = async (): Promise<void> => {
    await http.close();
    await closeDbConnection();
  };

  return { http, db: deps.db, teardown };
}

export async function clearAll(db: PgPromiseAdapter): Promise<void> {
  await db.none("TRUNCATE TABLE auth, users CASCADE");
}

export async function seedUser(
  app: TestApp,
  overrides?: { email?: string; password?: string },
): Promise<{ id: string; email: string }> {
  const email = overrides?.email ?? "test@example.com";
  const password = overrides?.password ?? "@Password123";

  const res = await app.http.inject({
    method: "POST",
    url: "/users",
    headers: { "content-type": "application/json" },
    payload: { name: "Test User", email, password, phone: "11999990000" },
  });

  if (res.statusCode !== 201) {
    throw new Error(`seedUser failed: ${res.statusCode} ${res.body}`);
  }

  return { id: res.json().id, email };
}

export async function login(
  app: TestApp,
  credentials: { email: string; password: string },
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await app.http.inject({
    method: "POST",
    url: "/auth/login",
    headers: { "content-type": "application/json" },
    payload: credentials,
  });

  if (res.statusCode !== 200) {
    throw new Error(`login failed: ${res.statusCode} ${res.body}`);
  }

  const setCookie = res.headers["set-cookie"] as string | undefined;
  const match = setCookie?.match(/refreshToken=([^;]+)/);
  const refreshToken = match?.[1] ?? "";

  return { accessToken: res.body, refreshToken };
}
