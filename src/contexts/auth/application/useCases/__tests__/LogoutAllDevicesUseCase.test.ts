import { makeRefreshToken } from "@contexts/auth/__tests__/factories/makeRefreshToken";
import { AuthRepositoryInMemory } from "@contexts/auth/__tests__/inMemory/AuthRepositoryInMemory";
import { makeMockAuthRepository } from "@contexts/auth/__tests__/mocks/makeMockAuthRepository";
import { LogoutAllDevicesUseCase } from "@contexts/auth/application/useCases/LogoutAllDevicesUseCase";
import { Result } from "@core/result/Result";
import { DBError } from "@shared/infra/errors/DBError";

describe("LogoutAllDevicesUseCase", () => {
  describe("success", () => {
    it("should revoke all refresh tokens for a user", async () => {
      // arrange
      const authRepository = new AuthRepositoryInMemory();
      const userId = "uuid-123";

      await authRepository.save(makeRefreshToken({ id: "token-1", userId }));

      await authRepository.save(makeRefreshToken({ id: "token-2", userId }));

      await authRepository.save(makeRefreshToken({ id: "token-3", userId }));

      // act
      const useCase = new LogoutAllDevicesUseCase(authRepository);
      const result = await useCase.execute({ userId });

      // assert
      expect(result.isOk).toBe(true);

      const t1 = await authRepository.findByJti("token-1");
      const t2 = await authRepository.findByJti("token-2");
      const t3 = await authRepository.findByJti("token-3");
      console.log(t1.value);

      expect(t1.value?.isRevoked()).toBe(true);
      expect(t2.value?.isRevoked()).toBe(true);
      expect(t3.value?.isRevoked()).toBe(true);
    });

    it("should not revoke tokens from other users", async () => {
      // arrange
      const authRepository = new AuthRepositoryInMemory();

      await authRepository.save(
        makeRefreshToken({
          id: "token-user-1",
          userId: "uuid-123",
        }),
      );

      await authRepository.save(
        makeRefreshToken({
          id: "token-user-2",
          userId: "uuid-456",
        }),
      );

      const useCase = new LogoutAllDevicesUseCase(authRepository);

      // act
      await useCase.execute({ userId: "uuid-123" });

      // assert
      const target = await authRepository.findByJti("token-user-1");
      const other = await authRepository.findByJti("token-user-2");

      expect(target.value?.isRevoked()).toBe(true);
      expect(other.value?.isRevoked()).toBe(false);
    });
  });

  describe("failure", () => {
    it("should return error when repository fails", async () => {
      // arrange
      const authRepository = makeMockAuthRepository();

      authRepository.revokeAllByUserId.mockResolvedValue(
        Result.err(DBError.create("Internal error")),
      );

      const useCase = new LogoutAllDevicesUseCase(authRepository);

      // act
      const result = await useCase.execute({
        userId: "uuid-123",
      });

      // assert
      expect(result.isErr).toBe(true);
    });
  });
});
