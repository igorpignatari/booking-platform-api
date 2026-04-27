import "dotenv/config";
import type { ILogger } from "@core/contracts/ILogger";
import { env } from "@shared/env/env";
import { HttpFastifyAdapter } from "@shared/infra/http/adapters/fastify/HttpFastifyAdapter";
import { registerUsersRoutes } from "./routes/users/usersRoutes";

export const bootstrap = async (logger: ILogger): Promise<void> => {
  logger.info("🚀 Starting server...", {
    port: env.port,
    env: env.nodeEnv,
  });

  const http = new HttpFastifyAdapter();
  await registerUsersRoutes(http);

  await http.listen(env.port, logger);

  const shutdown = async (signal: string) => {
    logger.info("Received shutdown signal, closing server...", { signal });

    try {
      await http.close();
      logger.info("Server closed gracefully");
      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown", { err });
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};
