import { makeDependencies } from "@main/dependencies";
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
  await http.ready();

  const teardown = async (): Promise<void> => {
    await http.close();
    await closeDbConnection();
  };

  return { http, db: deps.db, teardown };
}

export async function clearUsers(db: PgPromiseAdapter): Promise<void> {
  await db.none("TRUNCATE TABLE users CASCADE");
}
