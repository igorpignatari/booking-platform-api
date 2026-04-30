import { CreateUserUseCase } from "@contexts/users/application/useCases/CreateUserUseCase";
import { UserDAOPg } from "@contexts/users/infra/database/daos/pg/UserDAOPg";
import { UserRepositoryImpl } from "@contexts/users/infra/database/repositories/UserRepositoryImpl";
import { CreateUserController } from "@contexts/users/presentation/controllers/CreateUserController";
import type { Dependencies } from "src/main/dependencies";

export const makeUsersModule = (deps: Dependencies) => {
  // DAOS
  const userDAO = new UserDAOPg(deps.db);

  // repositories
  const userRepository = new UserRepositoryImpl(userDAO);

  // use cases
  const createUserUseCase = new CreateUserUseCase(userRepository, deps.hash);

  // controllers

  const createUserController = new CreateUserController(createUserUseCase);

  return {
    createUserController,
  };
};
