import type { HttpAdapter } from "@shared/presentation/protocols/HttpAdapter";
import { dependencies } from "src/main/dependencies";
import { makeUsersModule } from "src/main/factories/users/makeUsersModule";

export const usersModule = makeUsersModule(dependencies);

export const registerUsersRoutes = async (adapter: HttpAdapter) => {
  adapter.regitser("post", "/users", usersModule.createUserController, dependencies.logger, []);
};
