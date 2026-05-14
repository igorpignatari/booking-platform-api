import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { env } from "@shared/env/env";
import { BcryptHasher } from "@shared/infra/crypto/BcryptHasher";
import { PgPromiseAdapter } from "@shared/infra/database/adapters/PgPromiseAdapter";
import { getDbConnection } from "@shared/infra/database/connections/PgPromiseConnection";
import { PinoLogger } from "@shared/logger/PinoLogger";

export type Dependencies = ReturnType<typeof makeDependencies>;

export const makeDependencies = () =>
  ({
    hash: new BcryptHasher(),
    db: new PgPromiseAdapter(getDbConnection(env.databaseUrl)),
    jwt: new JWTServicesImpl(),
    logger: PinoLogger.create(),
  }) as const;
