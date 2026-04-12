import { CreateUserUseCase } from "@contexts/users/application/useCases/CreateUserUseCase";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";
import { UserRepositoryInMemory } from "../../inMemory/UserRepositoryInMemory";
import type { SutType } from "../types/Sut";

export const makeCreateUserUseCase = (deps?: Partial<SutType>) => {
  const userRepostory = deps?.userRepository ?? new UserRepositoryInMemory();
  const hasher = new HashInMemory();
  const useCase = new CreateUserUseCase(userRepostory, hasher);

  return {
    useCase,
  };
};
