import type { ILogger } from "@core/contracts/ILogger";
import { env } from "@shared/env/env";
import pino, { type Logger } from "pino";

const REDACTED_PATHS = [
  "*.password",
  "*.passwordHash",
  "*.token",
  "*.accessToken",
  "*.refreshToken",
  "*.secret",
  "*.authorization",
  "*.apiKey",
  "req.headers.authorization",
  "req.headers.cookie",
];

export class PinoLogger implements ILogger {
  private static readonly isProd = env.nodeEnv === "production";

  private constructor(private readonly logger: Logger) {}

  // ── Factory ────────────────────────────────────────────────────────────────

  static create(): PinoLogger {
    const logger = PinoLogger.isProd ? PinoLogger.createProdLogger() : PinoLogger.createDevLogger();

    return new PinoLogger(logger);
  }

  private static createDevLogger(): Logger {
    return pino({
      level: env.logLevel ?? "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
          messageFormat: "{msg} {context}",
          errorLikeObjectKeys: ["err", "error"],
        },
      },
      serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
      },
    });
  }

  private static createProdLogger(): Logger {
    return pino(
      {
        level: env.logLevel ?? "info",
        redact: {
          paths: REDACTED_PATHS,
          censor: "[REDACTED]",
        },
        serializers: {
          err: pino.stdSerializers.err,
          error: pino.stdSerializers.err,
          req: pino.stdSerializers.req,
          res: pino.stdSerializers.res,
        },
        base: {
          app: env.appName,
          env: env.nodeEnv,
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.destination({ dest: "./logs/app.log", sync: false }),
    );
  }

  // ── Methods ────────────────────────────────────────────────────────────────

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta ?? {}, message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(meta ?? {}, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(meta ?? {}, message);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(meta ?? {}, message);
  }

  fatal(message: string, meta?: Record<string, unknown>): void {
    this.logger.fatal(meta ?? {}, message);
  }

  child(meta: Record<string, unknown>): ILogger {
    return new PinoLogger(this.logger.child(meta));
  }
}
