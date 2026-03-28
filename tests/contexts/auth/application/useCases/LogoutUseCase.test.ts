import { LogoutUseCase } from "@contexts/auth/application/useCases/LogoutUseCase";
import { AuthRepositoryInMemory } from "@contexts/auth/infra/database/repository/AuthRepositoryInMemory";

describe("Logout use case", () => {
  it("should logout a user", async () => {
    const authRepository = new AuthRepositoryInMemory();
    const logoutUseCase = new LogoutUseCase(authRepository);
    const body = {
      refreshToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA0MjdiMGI5LTQ4Y2QtNDVjNi04YjkzLWVjNzcwZDQyNzY4NCIsImlhdCI6MTc3NDY1MTQyNSwiZXhwIjoxNzc1MjU2MjI1fQ.4xXM_h-dF_S1UefUcdWAefcIWbVY2DXlFdNPuoB7B8w",
    };
    const result = await logoutUseCase.execute(body);

    expect(result.value).toBe(undefined);
  });
});
