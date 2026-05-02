import "dotenv/config";
import { z } from "zod";

const durationSchema = z.string().regex(/^\d+(ms|s|m|h|d|w|y)$/, {
  message: "Must be a duration like '15m', '7d', '1h', '500ms'",
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  APP_NAME: z.string().min(1).default("my-backend"),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32, {
    message: "JWT_SECRET must be at least 32 characters long",
  }),
  JWT_REFRESH_SECRET: z.string().min(32, {
    message: "JWT_REFRESH_SECRET must be at least 32 characters long",
  }),
  JWT_EXPIRES_IN: durationSchema.default("15m"),
  JWT_REFRESH_EXPIRES_IN: durationSchema.default("7d"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("debug"),
  BCRYPT_ROUNDS: z.coerce.number().int().positive().default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  process.stderr.write(`\n❌ Invalid environment variables:\n${formatted}\n\n`);
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  host: parsed.data.HOST,
  appName: parsed.data.APP_NAME,
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtRefreshSecret: parsed.data.JWT_REFRESH_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  logLevel: parsed.data.LOG_LEVEL,
  bcryptRounds: parsed.data.BCRYPT_ROUNDS,
} as const;

export type Env = typeof env;

export const isProduction = env.nodeEnv === "production";
export const isTest = env.nodeEnv === "test";
export const isDevelopment = env.nodeEnv === "development";
