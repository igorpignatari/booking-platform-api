import { dependencies } from "./dependencies";
import { bootstrap } from "./server";

bootstrap(dependencies.logger).catch((err) => {
  const log = dependencies?.logger ?? console;
  log.fatal("Fatal error during bootstrap", { err });
  process.exit(1);
});
