import { makeRefreshToken } from "@contexts/auth/__tests__/factories/makeRefreshToken";
import { makeRefreshTokenUseCase } from "@contexts/auth/__tests__/factories/useCase/makeRefreshTokenUseCase";
import { makeMockAuthRepository } from "@contexts/auth/__tests__/mocks/makeMockAuthRepository";
import { RefreshTokenUseCase } from "@contexts/auth/application/useCases/RefreshTokenUseCase";
import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { Result } from "@core/result/Result";
import { DBError } from "@shared/infra/errors/DBError";

describe("Refresh token use case", () => {
  describe("success", () => {
    it("should return new accessToken and refreshToken", async () => {
      // Arrange
      const { useCase, authRepository } = makeRefreshTokenUseCase();
      const refreshToken = makeRefreshToken();

      await authRepository.save(refreshToken);

      // Act
      const result = await useCase.execute({ refreshToken: refreshToken.token });

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value.accessToken).toBeDefined();
      expect(result.value.refreshToken).toBeDefined();
      expect(result.value.refreshToken).not.toBe(refreshToken.token);
    });

    it("should delete the old token and save a new one", async () => {
      // Arrange
      const { useCase, authRepository } = makeRefreshTokenUseCase();
      const refreshToken = makeRefreshToken();

      await authRepository.save(refreshToken);

      // Act
      await useCase.execute({ refreshToken: refreshToken.token });

      const old = await authRepository.findByRefreshToken(refreshToken.token);
      // Assert
      expect(old.value).toBeNull();
    });
  });

  describe("failure", () => {
    it("should return error when token is not found", async () => {
      // Arrange
      const { useCase } = makeRefreshTokenUseCase();

      // Act
      const result = await useCase.execute({ refreshToken: "non-existent-token" });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when token is expired", async () => {
      // Arrange
      const { useCase, authRepository } = makeRefreshTokenUseCase();
      const expiredToken = makeRefreshToken({
        expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
      });

      await authRepository.save(expiredToken);

      // Act
      const result = await useCase.execute({ refreshToken: expiredToken.token });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when repository fails on findByRefreshToken", async () => {
      // Arrange
      const authRepository = makeMockAuthRepository();
      authRepository.findByRefreshToken.mockResolvedValue(
        Result.err(DBError.create("Internal error")),
      );

      const useCase = new RefreshTokenUseCase(authRepository, new JWTServicesImpl());

      // Act
      const result = await useCase.execute({ refreshToken: "any-token" });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when repository fails on delete", async () => {
      // Arrange
      const authRepository = makeMockAuthRepository();
      const refreshToken = makeRefreshToken();

      authRepository.findByRefreshToken.mockResolvedValue(Result.ok(refreshToken));
      authRepository.delete.mockResolvedValue(Result.err(DBError.create("Internal error")));

      const useCase = new RefreshTokenUseCase(authRepository, new JWTServicesImpl());

      // Act
      const result = await useCase.execute({ refreshToken: refreshToken.token });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when repository fails on save", async () => {
      // Arrange
      const authRepository = makeMockAuthRepository();
      const refreshToken = makeRefreshToken();

      authRepository.findByRefreshToken.mockResolvedValue(Result.ok(refreshToken));
      authRepository.delete.mockResolvedValue(Result.ok(undefined));
      authRepository.save.mockResolvedValue(Result.err(DBError.create("Internal error")));

      const useCase = new RefreshTokenUseCase(authRepository, new JWTServicesImpl());

      // Act
      const result = await useCase.execute({ refreshToken: refreshToken.token });

      // Assert
      expect(result.isErr).toBe(true);
    });
  });
});
