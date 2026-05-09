import { RefreshTokenUseCase } from "@contexts/auth/application/useCases/RefreshTokenUseCase";
import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { AuthRepositoryInMemory } from "../../inMemory/AuthRepositoryInMemory";
import { AuthUserRepositoryInMemory } from "../../inMemory/AuthUserRepositoryInMemory";

export const makeRefreshTokenUseCase = () => {
  const authRepository = new AuthRepositoryInMemory();
  const authUserRepository = new AuthUserRepositoryInMemory();
  const jwtService = new JWTServicesImpl();
  const useCase = new RefreshTokenUseCase(authUserRepository, authRepository, jwtService);

  return { useCase, authRepository, authUserRepository, jwtService };
};
