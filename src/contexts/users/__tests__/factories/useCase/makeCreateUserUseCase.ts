import type { UserRepository } from "@contexts/users/application/ports/output/UserRepository";
import { CreateUserUseCase } from "@contexts/users/application/useCases/CreateUserUseCase";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";
import { UserRepositoryInMemory } from "../../inMemory/UserRepositoryInMemory";

type Dependencies = {
  userRepository: UserRepository;
};

export const makeCreateUserUseCase = (deps?: Partial<Dependencies>) => {
  const userRepository = deps?.userRepository ?? new UserRepositoryInMemory();
  const hasher = new HashInMemory();
  const useCase = new CreateUserUseCase(userRepository, hasher);

  return {
    useCase,
  };
};
