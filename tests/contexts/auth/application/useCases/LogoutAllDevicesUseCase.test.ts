import { LogoutAllDevicesUseCase } from "@contexts/auth/application/useCases/LogoutAllDevicesUseCase";
import { AuthRepositoryInMemory } from "@contexts/auth/infra/database/repository/AuthRepositoryInMemory";

describe("Logout all devices use case", () => {
  it("should logout all devices", async () => {
    const authRepository = new AuthRepositoryInMemory();
    const logoutAllDevices = new LogoutAllDevicesUseCase(authRepository);
    const body = {
      userId: "1",
    };
    const result = await logoutAllDevices.execute(body);

    expect(result.value).toBe(undefined);
  });
});
