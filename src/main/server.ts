import "dotenv/config";
import type { ILogger } from "@core/contracts/ILogger";
import { env } from "@shared/env/env";
import { HttpExpressAdapter } from "@shared/infra/http/adapters/express/HttpExpressAdapter";
import { registerUsersRoutes } from "./routes/users/usersRoutes";

export const bootstrap = async (logger: ILogger): Promise<void> => {
  logger.info("🚀 Starting server...", {
    port: env.port,
    env: env.nodeEnv,
  });

  const http = new HttpExpressAdapter();
  await registerUsersRoutes(http);

  await http.listen(env.port, logger);
};
