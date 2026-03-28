import { RefreshTokenUseCase } from "@contexts/auth/application/useCases/RefreshTokenUseCase";
import { AuthRepositoryInMemory } from "@contexts/auth/infra/database/repository/AuthRepositoryInMemory";
import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { RefreshTokenController } from "@contexts/auth/presentation/controllers/RefreshTokenController";
import { PinoLogger } from "@shared/logger/PinoLogger";

describe("Refresh token controller", () => {
  it("should refresh token", async () => {
    const logger = PinoLogger.create();
    const authRepository = new AuthRepositoryInMemory();
    const jwtServices = new JWTServicesImpl();
    const refreshTokenUseCase = new RefreshTokenUseCase(authRepository, jwtServices);
    const refreshTokenController = new RefreshTokenController(refreshTokenUseCase);

    const request = {
      body: {
        refreshToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA0MjdiMGI5LTQ4Y2QtNDVjNi04YjkzLWVjNzcwZDQyNzY4NCIsImlhdCI6MTc3NDY1MTQyNSwiZhwIjoxNzc1MjU2MjI1fQ.4xXM_h-dF_S1UefUcdWAefcIWbVY2DXlFdNPuoB7B8w",
      },
      params: null,
      query: null,
      correlationId: "1",
      logger: logger,
    };
    const result = await refreshTokenController.handle(request);

    expect(result.statusCode).toBe(200);
  });
});
