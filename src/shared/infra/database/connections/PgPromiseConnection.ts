import { env } from "@shared/env/env";
import pgPromise from "pg-promise";

export const pgp = pgPromise();

export const DB_CONNECTION = pgp(env.databaseUrl);
