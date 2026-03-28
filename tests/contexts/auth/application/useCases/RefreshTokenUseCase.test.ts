import { RefreshTokenUseCase } from "@contexts/auth/application/useCases/RefreshTokenUseCase";
import { AuthRepositoryInMemory } from "@contexts/auth/infra/database/repository/AuthRepositoryInMemory";
import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";

describe("Refresh token use case", () => {
  it("should refresh token", async () => {
    const authRepository = new AuthRepositoryInMemory();
    const jwtServices = new JWTServicesImpl();
    const refreshTokenUseCase = new RefreshTokenUseCase(authRepository, jwtServices);
    const body = {
      refreshToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA0MjdiMGI5LTQ4Y2QtNDVjNi04YjkzLWVjNzcwZDQyNzY4NCIsImlhdCI6MTc3NDY1MTQyNSwiZhwIjoxNzc1MjU2MjI1fQ.4xXM_h-dF_S1UefUcdWAefcIWbVY2DXlFdNPuoB7B8w",
    };
    const result = await refreshTokenUseCase.execute(body);

    expect(result.value.accessToken).toBeDefined();
    expect(result.value.refreshToken).toBeDefined();
  });
});
