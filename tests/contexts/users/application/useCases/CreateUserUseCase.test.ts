import { CreateUserUseCase } from "@contexts/users/application/useCases/CreateUserUseCase";
import { User } from "@contexts/users/domain/entity/User";
import { UserRepositoryInMemory } from "@contexts/users/infra/database/repository/UserRepositoryInMemory";
import { HashInMemory } from "@shared/crypto/HashInMemory";

describe("Create user use case", () => {
  it("should create a user", async () => {
    const userRepo = new UserRepositoryInMemory();
    const hasher = new HashInMemory();
    const useCase = new CreateUserUseCase(userRepo, hasher);

    const user = await useCase.execute({
      name: "joe doe",
      email: "joe_doe@example.com",
      password: "@Password123",
      phone: "+1234567890",
    });

    expect(user.isOk).toBe(true);
    expect(user.value).toBeInstanceOf(User);
    expect(user.value.id).toBeDefined();
    expect(user.value.name).toBe("joe doe");
    expect(user.value.email.getValue()).toBe("joe_doe@example.com");
    expect(user.value.password.getValue()).toBe("hashed-@Password123");
    expect(user.value.phone).toBe("+1234567890");
    expect(user.value.role).toBe("user");
  });
});
