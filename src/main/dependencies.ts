import { PinoLogger } from "@shared/logger/PinoLogger";

export const dependencies = {
  logger: PinoLogger.create(),
} as const;
