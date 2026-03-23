import { LoginUseCase } from "@contexts/auth/application/useCases/LoginUseCase";
import { AuthRepositoryInMemory } from "@contexts/auth/infra/database/repository/AuthRepositoryInMemory";
import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { User } from "@contexts/users/domain/entity/User";
import { UserRepositoryInMemory } from "@contexts/users/infra/database/repository/UserRepositoryInMemory";
import { HashInMemory } from "@shared/crypto/HashInMemory";

describe("Login use case", () => {
  it("should login a user", async () => {
    const userRepository = new UserRepositoryInMemory();
    const authRepository = new AuthRepositoryInMemory();
    const jwtServices = new JWTServicesImpl();
    const hashServices = new HashInMemory();

    const user = {
      name: "joe doe",
      email: "joe_doe@example.com",
      password: "@Password123",
      phone: "1111111111",
    };

    const newUser = await User.create(user, hashServices);

    await userRepository.create(newUser.value);

    const loginUseCase = new LoginUseCase(
      authRepository,
      userRepository,
      jwtServices,
      hashServices,
    );

    const result = await loginUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result.value.accessToken).toBeDefined();
    expect(result.value.refreshToken).toBeDefined();
  });
});
