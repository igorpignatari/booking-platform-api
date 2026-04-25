import { UserRepositoryInMemory } from "@contexts/users/__tests__/inMemory/UserRepositoryInMemory";
import { CreateUserUseCase } from "@contexts/users/application/useCases/CreateUserUseCase";
import { CreateUserController } from "@contexts/users/presentation/controllers/CreateUserController";
import type { Dependencies } from "src/main/dependencies";

export const makeUsersModule = (deps: Dependencies) => {
  // repositories
  const userRepository = new UserRepositoryInMemory();

  // use cases
  const createUserUseCase = new CreateUserUseCase(userRepository, deps.hash);

  // controllers

  const createUserController = new CreateUserController(createUserUseCase);

  return {
    createUserController,
  };
};
