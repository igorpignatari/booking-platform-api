import { LoginUseCase } from "@contexts/auth/application/useCases/LoginUseCase";
import { AuthRepositoryInMemory } from "@contexts/auth/infra/database/repository/AuthRepositoryInMemory";
import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { LoginController } from "@contexts/auth/presentation/controllers/LoginController";
import { User } from "@contexts/users/domain/entity/User";
import { UserRepositoryInMemory } from "@contexts/users/infra/database/repository/UserRepositoryInMemory";
import { HashInMemory } from "@shared/crypto/HashInMemory";
import { PinoLogger } from "@shared/logger/PinoLogger";

describe("Login controller", () => {
  it("should login a user", async () => {
    const userRespository = new UserRepositoryInMemory();
    const authRepository = new AuthRepositoryInMemory();
    const hashServices = new HashInMemory();
    const jwtServices = new JWTServicesImpl();
    const logger = PinoLogger.create();
    const loginUseCase = new LoginUseCase(
      authRepository,
      userRespository,
      jwtServices,
      hashServices,
    );
    const loginController = new LoginController(loginUseCase);

    const user = {
      name: "joe doe",
      email: "joe_doe@example.com",
      password: "@Password123",
      phone: "1111111111",
    };

    const newUser = await User.create(user, hashServices);
    await userRespository.create(newUser.value);

    const loginUser = {
      email: "joe_doe@example.com",
      password: "@Password123",
    };

    const response = await loginController.handle({
      body: loginUser,
      params: null,
      query: null,
      correlationId: "2",
      logger: logger,
    });

    expect(response.statusCode).toBe(200);
  });
});
