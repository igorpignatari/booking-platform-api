import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";
import { env } from "@shared/env/env";
import { PgPromiseAdapter } from "@shared/infra/database/adapters/PgPromiseAdapter";
import { getDbConnection } from "@shared/infra/database/connections/PgPromiseConnection";
import { PinoLogger } from "@shared/logger/PinoLogger";

export type Dependencies = typeof dependencies;

export const dependencies = {
  hash: new HashInMemory(),
  db: new PgPromiseAdapter(getDbConnection(env.databaseUrl)),
  logger: PinoLogger.create(),
} as const;
