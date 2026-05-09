import type { AuthRepository } from "@contexts/auth/application/ports/output/AuthRepository";
import { LoginUseCase } from "@contexts/auth/application/useCases/LoginUseCase";
import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";
import { AuthRepositoryInMemory } from "../../inMemory/AuthRepositoryInMemory";
import { makeMockAuthUserRepository } from "../../mocks/makeMockAuthUserRepository";

type dependencies = {
  authRepository: AuthRepository;
};

export const makeLoginUseCase = (deps?: Partial<dependencies>) => {
  const userRepository = makeMockAuthUserRepository();
  const authRepository = deps?.authRepository ?? new AuthRepositoryInMemory();
  const jwtServices = new JWTServicesImpl();
  const hashServices = new HashInMemory();

  const useCase = new LoginUseCase(authRepository, userRepository, jwtServices, hashServices);

  return {
    useCase,
    userRepository,
  };
};
