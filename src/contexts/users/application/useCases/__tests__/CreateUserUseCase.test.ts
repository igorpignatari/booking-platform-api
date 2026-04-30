import { makeUser } from "@contexts/users/__tests__/factories/makeUser";
import { makeCreateUserUseCase } from "@contexts/users/__tests__/factories/useCase/makeCreateUserUseCase";
import { makeMockUserRepository } from "@contexts/users/__tests__/mocks/makeMockUserRepository";
import { Result } from "@core/result/Result";
import { DBError } from "@shared/infra/errors/DBError";

describe("Create user use Case test", () => {
  describe("success with mock", () => {
    it("should create a user when email is not taken", async () => {
      // Arrange
      const userRepository = makeMockUserRepository();
      userRepository.findByEmail.mockResolvedValue(Result.ok(null));
      userRepository.create.mockResolvedValue(Result.ok());

      const { useCase } = makeCreateUserUseCase({ userRepository });
      const input = makeUser();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value).toBeDefined();

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("failure with mock", () => {
    it("should return error when email is already taken", async () => {
      // Arrange
      const userRepository = makeMockUserRepository();
      const existingUser = { id: "1", email: "joe_doe@example.com" } as any;
      userRepository.findByEmail.mockResolvedValue(Result.ok(existingUser));

      const { useCase } = makeCreateUserUseCase({ userRepository });
      const input = makeUser();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isErr).toBe(true);
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should not call create when findByEmail fails", async () => {
      // Arrange
      const userRepository = makeMockUserRepository();
      userRepository.findByEmail.mockResolvedValue(Result.err(DBError.create("Internal error")));

      const { useCase } = makeCreateUserUseCase({ userRepository });

      // Act
      const result = await useCase.execute(makeUser());

      // Assert
      expect(result.isErr).toBe(true);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("success with InMemory", () => {
    it("should create a user successfully", async () => {
      // Arrange
      const { useCase } = makeCreateUserUseCase();
      const input = makeUser();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value.name).toBe(input.name);
      expect(result.value.phone).toBe(input.phone);
      expect(result.value.email.getValue()).toBe(input.email);
      expect(result.value.id).toBeDefined();
    });

    it("should hash the password", async () => {
      // Arrange
      const { useCase } = makeCreateUserUseCase();
      const input = makeUser();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.value.password.getValue()).not.toBe(input.password);
      expect(result.value.password.getValue()).toBe(`hashed-${input.password}`);
    });
  });

  describe("failure with InMemory", () => {
    it("should return error when email is already taken", async () => {
      // Arrange
      const { useCase } = makeCreateUserUseCase();
      const input = makeUser();

      await useCase.execute(input);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when email is invalid", async () => {
      // Arrange
      const { useCase } = makeCreateUserUseCase();
      const input = makeUser();

      // Act
      const result = await useCase.execute({ ...input, email: "invalid-email" });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when password is invalid", async () => {
      // Arrange
      const { useCase } = makeCreateUserUseCase();
      const input = makeUser();

      // Act
      const result = await useCase.execute({ ...input, password: "weak" });

      // Assert
      expect(result.isErr).toBe(true);
    });
  });
});
