import { env } from "@shared/env/env";
import { HttpFastifyAdapter } from "@shared/infra/http/adapters/fastify/HttpFastifyAdapter";
import type { Dependencies } from "./dependencies";
import { registerUsersRoutes } from "./routes/users/usersRoutes";

export const bootstrap = async (deps: Dependencies): Promise<void> => {
  deps.logger.info("🚀 Starting server...", {
    port: env.port,
    env: env.nodeEnv,
  });

  // Probe DB before binding
  try {
    await deps.db.one("SELECT 1");
    deps.logger.info("✅ Database connection OK");
  } catch (err) {
    deps.logger.fatal("❌ Database unreachable", { err });
    throw err;
  }

  const http = new HttpFastifyAdapter();
  registerUsersRoutes(http, deps);

  await http.listen(env.port, env.host, deps.logger);

  const shutdown = async (signal: string) => {
    deps.logger.info("Received shutdown signal, closing server...", { signal });

    try {
      await http.close();
      await deps.db.disconnect();
      deps.logger.info("Server closed gracefully");
      process.exit(0);
    } catch (err) {
      deps.logger.error("Error during shutdown", { err });
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};
