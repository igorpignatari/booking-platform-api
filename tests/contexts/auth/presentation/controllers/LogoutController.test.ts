import { LogoutUseCase } from "@contexts/auth/application/useCases/LogoutUseCase";
import { AuthRepositoryInMemory } from "@contexts/auth/infra/database/repository/AuthRepositoryInMemory";
import { LogoutController } from "@contexts/auth/presentation/controllers/LogoutController";
import { PinoLogger } from "@shared/logger/PinoLogger";

describe("Logout controller", () => {
  it("should logout a user", async () => {
    const logger = PinoLogger.create();
    const authRepository = new AuthRepositoryInMemory();
    const logoutUseCase = new LogoutUseCase(authRepository);
    const logoutController = new LogoutController(logoutUseCase);

    const request = {
      body: {
        refreshToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA0MjdiMGI5LTQ4Y2QtNDVjNi04YjkzLWVjNzcwZDQyNzY4NCIsImlhdCI6MTc3NDY1MTQyNSwiZXhwIjoxNzc1MjU2MjI1fQ.4xXM_h-dF_S1UefUcdWAefcIWbVY2DXlFdNPuoB7B8w",
      },
      params: null,
      query: null,
      correlationId: "1",
      logger: logger,
    };
    const result = await logoutController.handle(request);

    expect(result.statusCode).toBe(200);
  });
});
