import { LoginUseCase } from "@contexts/auth/application/useCases/LoginUseCase";
import { LogoutAllDevicesUseCase } from "@contexts/auth/application/useCases/LogoutAllDevicesUseCase";
import { LogoutUseCase } from "@contexts/auth/application/useCases/LogoutUseCase";
import { RefreshTokenUseCase } from "@contexts/auth/application/useCases/RefreshTokenUseCase";
import { AuthDAO } from "@contexts/auth/infra/database/DAOs/pg/AuthDAO";
import { AuthUserDAO } from "@contexts/auth/infra/database/DAOs/pg/AuthUserDAO";
import { AuthRepositoryImpl } from "@contexts/auth/infra/database/repositories/AuthRepositoryImpl";
import { AuthUserRepositoryImpl } from "@contexts/auth/infra/database/repositories/AuthUserRepositoryImpl";
import { LoginController } from "@contexts/auth/presentation/controllers/LoginController";
import { LogoutAllDevicesController } from "@contexts/auth/presentation/controllers/LogoutAllDevicesController";
import { LogoutController } from "@contexts/auth/presentation/controllers/LogoutController";
import { RefreshTokenController } from "@contexts/auth/presentation/controllers/RefreshTokenController";
import type { Dependencies } from "@main/dependencies";

export const makeAuthModules = (deps: Dependencies) => {
  //DAOs
  const authUserDAO = new AuthUserDAO(deps.db);
  const authDAO = new AuthDAO(deps.db);

  //Repositories
  const authUserRepository = new AuthUserRepositoryImpl(authUserDAO);
  const authRepository = new AuthRepositoryImpl(authDAO);

  //Use Cases
  const loginUseCase = new LoginUseCase(authRepository, authUserRepository, deps.jwt, deps.hash);
  const refreshTokenUseCase = new RefreshTokenUseCase(authUserRepository, authRepository, deps.jwt);
  const logoutUseCase = new LogoutUseCase(authRepository);
  const logoutAllDevicesUseCase = new LogoutAllDevicesUseCase(authRepository);

  //Controllers
  const loginController = new LoginController(loginUseCase);
  const refreshTokenController = new RefreshTokenController(refreshTokenUseCase);
  const logoutController = new LogoutController(logoutUseCase);
  const logoutAllDevicesController = new LogoutAllDevicesController(logoutAllDevicesUseCase);

  return {
    loginController,
    refreshTokenController,
    logoutController,
    logoutAllDevicesController,
  };
};
