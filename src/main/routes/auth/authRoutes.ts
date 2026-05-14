import { LoginSchema } from "@contexts/auth/application/DTOs/LoginDTO";
import { LogoutAllDevicesSchema } from "@contexts/auth/application/DTOs/LogoutAllDevicesDTO";
import { LogoutSchema } from "@contexts/auth/application/DTOs/LogoutDTO";
import type { Dependencies } from "@main/dependencies";
import { makeAuthModules } from "@main/factories/auth/makeAuthModules";
import { ValidationMiddleware } from "@shared/presentation/middlewares/ValidationMiddleware";
import type { HttpAdapter } from "@shared/presentation/protocols/HttpAdapter";

export const registerAuthRoutes = (adapter: HttpAdapter, deps: Dependencies) => {
  const authModule = makeAuthModules(deps);
  const loginMiddlewares = [new ValidationMiddleware(LoginSchema)];
  const logoutMiddlewares = [new ValidationMiddleware(LogoutSchema)];
  const logoutAllDevicesMiddlewares = [new ValidationMiddleware(LogoutAllDevicesSchema)];

  adapter.register(
    "post",
    "/auth/login",
    authModule.loginController,
    deps.logger,
    loginMiddlewares,
  );
  adapter.register(
    "post",
    "/auth/refresh-token",
    authModule.refreshTokenController,
    deps.logger,
    [],
  );
  adapter.register(
    "post",
    "/auth/logout",
    authModule.logoutController,
    deps.logger,
    logoutMiddlewares,
  );
  adapter.register(
    "post",
    "/auth/logout-all-devices",
    authModule.logoutAllDevicesController,
    deps.logger,
    logoutAllDevicesMiddlewares,
  );
};
