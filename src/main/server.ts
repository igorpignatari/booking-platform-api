import type { ILogger } from "@core/contracts/ILogger";
import { env } from "@shared/env/env";

export const bootstrap = async (logger: ILogger): Promise<void> => {
  logger.info("🚀 Starting server...", {
    port: env.port,
    env: env.nodeEnv,
  });

  // TODO: start server here!
};
