import { LogoutAllDevicesUseCase } from "@contexts/auth/application/useCases/LogoutAllDevicesUseCase";
import { AuthRepositoryInMemory } from "@contexts/auth/infra/database/repository/AuthRepositoryInMemory";
import { LogoutAllDevicesController } from "@contexts/auth/presentation/controllers/LogoutAllDevicesController";
import { PinoLogger } from "@shared/logger/PinoLogger";

describe("Logout all devices controller", () => {
  it("should logout all devices", async () => {
    const logger = PinoLogger.create();
    const authRepository = new AuthRepositoryInMemory();
    const logoutAllDevicesUseCase = new LogoutAllDevicesUseCase(authRepository);
    const logoutAllDevicesController = new LogoutAllDevicesController(logoutAllDevicesUseCase);

    const request = {
      body: {
        userId: "1",
      },
      params: null,
      query: null,
      correlationId: "1",
      logger: logger,
    };
    const result = await logoutAllDevicesController.handle(request);

    expect(result.statusCode).toBe(200);
  });
});
