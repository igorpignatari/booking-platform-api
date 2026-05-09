import { makeAuthUser } from "@contexts/auth/__tests__/factories/makeAuthUser";
import { makeRefreshToken } from "@contexts/auth/__tests__/factories/makeRefreshToken";
import { makeRefreshTokenUseCase } from "@contexts/auth/__tests__/factories/useCase/makeRefreshTokenUseCase";
import { makeMockAuthRepository } from "@contexts/auth/__tests__/mocks/makeMockAuthRepository";
import { makeMockAuthUserRepository } from "@contexts/auth/__tests__/mocks/makeMockAuthUserRepository";
import { RefreshTokenUseCase } from "@contexts/auth/application/useCases/RefreshTokenUseCase";
import { AuthUser } from "@contexts/auth/domain/entities/AuthUser";
import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { Result } from "@core/result/Result";
import { DBError } from "@shared/infra/errors/DBError";

describe("RefreshTokenUseCase", () => {
  describe("success", () => {
    it("should return new accessToken and refreshToken", async () => {
      // Arrange
      const { useCase, authRepository, authUserRepository } = makeRefreshTokenUseCase();
      const refreshToken = makeRefreshToken();
      const user = makeAuthUser({ id: refreshToken.userId });

      await authRepository.save(refreshToken);
      authUserRepository.users.push({
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.role as "user" | "admin",
        name: "Joe Doe",
        phone: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Act
      const result = await useCase.execute({ jti: refreshToken.id });

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value.accessToken).toBeDefined();
      expect(result.value.refreshToken).toBeDefined();
    });

    it("should revoke the old token and save a new one", async () => {
      // Arrange
      const { useCase, authRepository, authUserRepository } = makeRefreshTokenUseCase();
      const refreshToken = makeRefreshToken();
      const user = makeAuthUser({ id: refreshToken.userId });

      await authRepository.save(refreshToken);
      authUserRepository.users.push({
        id: user.id,
        email: user.email,
        password: user.password,
        role: user.role as "user" | "admin",
        name: "Joe Doe",
        phone: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Act
      await useCase.execute({ jti: refreshToken.id });

      // Assert — old token must be revoked
      const old = await authRepository.findByJti(refreshToken.id);
      expect(old.value?.revokedAt).not.toBeNull();
    });
  });

  describe("failure", () => {
    it("should return error when token is not found", async () => {
      // Arrange
      const { useCase } = makeRefreshTokenUseCase();

      // Act
      const result = await useCase.execute({ jti: "non-existent-jti" });

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
      const result = await useCase.execute({ jti: expiredToken.id });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when token is revoked", async () => {
      // Arrange
      const { useCase, authRepository } = makeRefreshTokenUseCase();
      const refreshToken = makeRefreshToken();
      await authRepository.save(refreshToken);
      await authRepository.revoke(refreshToken.id);

      // Act
      const result = await useCase.execute({ jti: refreshToken.id });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when user is not found", async () => {
      // Arrange
      const { useCase, authRepository } = makeRefreshTokenUseCase();
      // Save token but do NOT add a matching user in authUserRepository
      const refreshToken = makeRefreshToken({ userId: "ghost-user-id" });
      await authRepository.save(refreshToken);

      // Act
      const result = await useCase.execute({ jti: refreshToken.id });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when authRepository.findByJti fails", async () => {
      // Arrange
      const authRepository = makeMockAuthRepository();
      const authUserRepository = makeMockAuthUserRepository();

      authRepository.findByJti.mockResolvedValue(Result.err(DBError.create("Internal error")));

      const useCase = new RefreshTokenUseCase(
        authUserRepository,
        authRepository,
        new JWTServicesImpl(),
      );

      // Act
      const result = await useCase.execute({ jti: "any-jti" });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when authRepository.revoke fails", async () => {
      // Arrange
      const authRepository = makeMockAuthRepository();
      const authUserRepository = makeMockAuthUserRepository();
      const refreshToken = makeRefreshToken();

      authRepository.findByJti.mockResolvedValue(Result.ok(refreshToken));
      authUserRepository.findByUserIdForAuth.mockResolvedValue(
        Result.ok(
          AuthUser.create({
            id: refreshToken.userId,
            email: "a@b.com",
            password: "x",
            role: "user",
          }),
        ),
      );
      authRepository.revoke.mockResolvedValue(Result.err(DBError.create("Internal error")));

      const useCase = new RefreshTokenUseCase(
        authUserRepository,
        authRepository,
        new JWTServicesImpl(),
      );

      // Act
      const result = await useCase.execute({ jti: refreshToken.id });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when authRepository.save fails", async () => {
      // Arrange
      const authRepository = makeMockAuthRepository();
      const authUserRepository = makeMockAuthUserRepository();
      const refreshToken = makeRefreshToken();

      authRepository.findByJti.mockResolvedValue(Result.ok(refreshToken));
      authUserRepository.findByUserIdForAuth.mockResolvedValue(
        Result.ok(
          AuthUser.create({
            id: refreshToken.userId,
            email: "a@b.com",
            password: "x",
            role: "user",
          }),
        ),
      );
      authRepository.revoke.mockResolvedValue(Result.ok(undefined));
      authRepository.save.mockResolvedValue(Result.err(DBError.create("Internal error")));

      const useCase = new RefreshTokenUseCase(
        authUserRepository,
        authRepository,
        new JWTServicesImpl(),
      );

      // Act
      const result = await useCase.execute({ jti: refreshToken.id });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when authUserRepository.findByUserIdForAuth fails", async () => {
      // Arrange
      const authRepository = makeMockAuthRepository();
      const authUserRepository = makeMockAuthUserRepository();
      const refreshToken = makeRefreshToken();

      authRepository.findByJti.mockResolvedValue(Result.ok(refreshToken));
      authUserRepository.findByUserIdForAuth.mockResolvedValue(
        Result.err(DBError.create("Internal error")),
      );

      const useCase = new RefreshTokenUseCase(
        authUserRepository,
        authRepository,
        new JWTServicesImpl(),
      );

      // Act
      const result = await useCase.execute({ jti: refreshToken.id });

      // Assert
      expect(result.isErr).toBe(true);
    });
  });
});
