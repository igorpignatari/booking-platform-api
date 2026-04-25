import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";
import { PinoLogger } from "@shared/logger/PinoLogger";

export type Dependencies = typeof dependencies;

export const dependencies = {
  hash: new HashInMemory(),
  logger: PinoLogger.create(),
} as const;
