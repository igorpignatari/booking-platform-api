import { makeDependencies } from "./dependencies";
import { bootstrap } from "./server";

const dependencies = makeDependencies();

bootstrap(dependencies).catch((err) => {
  const log = dependencies?.logger ?? console;
  log.fatal("Fatal error during bootstrap", { err });
  process.exit(1);
});
