import { CreateUserSchema } from "@contexts/users/application/DTOs/createUserDTO";
import type { Dependencies } from "@main/dependencies";
import { makeUsersModule } from "@main/factories/users/makeUsersModule";
import { ValidationMiddleware } from "@shared/presentation/middlewares/ValidationMiddleware";
import type { HttpAdapter } from "@shared/presentation/protocols/HttpAdapter";

export const registerUsersRoutes = (adapter: HttpAdapter, deps: Dependencies) => {
  const usersModule = makeUsersModule(deps);
  const middlewares = [new ValidationMiddleware(CreateUserSchema)];
  adapter.register("post", "/users", usersModule.createUserController, deps.logger, middlewares);
};
