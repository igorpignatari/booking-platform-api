import { makeAuthUser } from "@contexts/auth/__tests__/factories/makeAuthUser";
import { makeLoginUseCase } from "@contexts/auth/__tests__/factories/useCase/makeLoginUseCase";
import { AuthUser } from "@contexts/auth/domain/entities/AuthUser";
import { Result } from "@core/result/Result";

describe("LoginUseCase", () => {
  describe("success", () => {
    it("should return accessToken and refreshToken", async () => {
      // Arrange
      const { useCase, userRepository } = makeLoginUseCase();
      const authUser = makeAuthUser();

      userRepository.findByEmailForAuth.mockResolvedValue(Result.ok(AuthUser.create(authUser)));

      // Act
      const result = await useCase.execute({
        email: authUser.email,
        password: "@Password123",
      });

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value.accessToken).toBeDefined();
      expect(result.value.refreshToken).toBeDefined();
    });
  });

  describe("failure", () => {
    it("should return error when user is not found", async () => {
      // Arrange
      const { useCase, userRepository } = makeLoginUseCase();
      userRepository.findByEmailForAuth.mockResolvedValue(Result.ok(null));

      // Act
      const result = await useCase.execute({ email: "x@x.com", password: "any" });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when password is wrong", async () => {
      // Arrange
      const { useCase, userRepository } = makeLoginUseCase();
      userRepository.findByEmailForAuth.mockResolvedValue(
        Result.ok(AuthUser.create(makeAuthUser())),
      );

      // Act
      const result = await useCase.execute({
        email: makeAuthUser().email,
        password: "wrong-password",
      });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when repository fails", async () => {
      // Arrange
      const { useCase, userRepository } = makeLoginUseCase();
      userRepository.findByEmailForAuth.mockResolvedValue(Result.err(new Error("DB error")));

      // Act
      const result = await useCase.execute({ email: "x@x.com", password: "any" });

      // Assert
      expect(result.isErr).toBe(true);
    });
  });
});
