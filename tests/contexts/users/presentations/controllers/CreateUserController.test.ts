import { CreateUserUseCase } from "@contexts/users/application/useCases/CreateUserUseCase";
import { UserRepositoryInMemory } from "@contexts/users/infra/database/repository/UserRepositoryInMemory";
import { CreateUserController } from "@contexts/users/presentation/controllers/CreateUserController";
import { HashInMemory } from "@shared/crypto/HashInMemory";
import { PinoLogger } from "@shared/logger/PinoLogger";

describe("Create user controller", () => {
  it("should create a user", async () => {
    const user = {
      name: "joe doe",
      email: "joe_doe@example.com",
      password: "@Password123",
      phone: "+1234567890",
    };

    const logger = PinoLogger.create();
    const userRepo = new UserRepositoryInMemory();
    const hasher = new HashInMemory();
    const useCase = new CreateUserUseCase(userRepo, hasher);
    const controller = new CreateUserController(useCase);

    const response = await controller.handle({
      body: user,
      params: null,
      query: null,
      correlationId: "1",
      logger: logger,
    });

    expect(response.statusCode).toBe(201);
    expect(response.data).toBeInstanceOf(Object);
  });
});
