import { RefreshTokenUseCase } from "@contexts/auth/application/useCases/RefreshTokenUseCase";
import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { AuthRepositoryInMemory } from "../../inMemory/AuthRepositoryInMemory";

export const makeRefreshTokenUseCase = () => {
  const authRepository = new AuthRepositoryInMemory();
  const jwtService = new JWTServicesImpl();
  const useCase = new RefreshTokenUseCase(authRepository, jwtService);

  return { useCase, authRepository, jwtService };
};
