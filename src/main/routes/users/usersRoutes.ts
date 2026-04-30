import { CreateUserSchema } from "@contexts/users/application/DTOs/createUserDTO";
import { ValidationMiddleware } from "@shared/presentation/middlewares/ValidationMiddleware";
import type { HttpAdapter } from "@shared/presentation/protocols/HttpAdapter";
import type { Dependencies } from "src/main/dependencies";
import { makeUsersModule } from "src/main/factories/users/makeUsersModule";

export const registerUsersRoutes = (adapter: HttpAdapter, deps: Dependencies) => {
  const usersModule = makeUsersModule(deps);
  const middlewares = [new ValidationMiddleware(CreateUserSchema)];
  adapter.register("post", "/users", usersModule.createUserController, deps.logger, middlewares);
};
