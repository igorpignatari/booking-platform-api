import { makeRefreshToken } from "@contexts/auth/__tests__/factories/makeRefreshToken";
import { AuthRepositoryInMemory } from "@contexts/auth/__tests__/inMemory/AuthRepositoryInMemory";
import { makeMockAuthRepository } from "@contexts/auth/__tests__/mocks/makeMockAuthRepository";
import { LogoutAllDevicesUseCase } from "@contexts/auth/application/useCases/LogoutAllDevicesUseCase";
import { Result } from "@core/result/Result";
import { DBError } from "@shared/infra/errors/DBError";

describe("Logout all devices use case", () => {
  describe("success", () => {
    it("should delete all refresh tokens for a user", async () => {
      // arrange
      const authRepository = new AuthRepositoryInMemory();
      const userId = "uuid-123";

      // save many tokens from the same user
      await authRepository.save(makeRefreshToken({ userId, token: "token-1" }));
      await authRepository.save(makeRefreshToken({ userId, token: "token-2" }));
      await authRepository.save(makeRefreshToken({ userId, token: "token-3" }));

      // act
      const useCase = new LogoutAllDevicesUseCase(authRepository);
      const result = await useCase.execute({ userId });

      // assert
      expect(result.isOk).toBe(true);

      // check that all tokens were deleted
      const t1 = await authRepository.findByRefreshToken("token-1");
      const t2 = await authRepository.findByRefreshToken("token-2");
      const t3 = await authRepository.findByRefreshToken("token-3");

      expect(t1.value).toBeNull();
      expect(t2.value).toBeNull();
      expect(t3.value).toBeNull();
    });

    it("should not delete tokens from other users", async () => {
      // arrange
      const authRepository = new AuthRepositoryInMemory();

      await authRepository.save(makeRefreshToken({ userId: "uuid-123", token: "token-user-1" }));
      await authRepository.save(makeRefreshToken({ userId: "uuid-456", token: "token-user-2" }));

      // act
      const useCase = new LogoutAllDevicesUseCase(authRepository);
      await useCase.execute({ userId: "uuid-123" });

      // assert
      const other = await authRepository.findByRefreshToken("token-user-2");
      expect(other.value).not.toBeNull();
    });
  });

  describe("failure", () => {
    it("should return error when repository fails", async () => {
      // arrange
      const authRepository = makeMockAuthRepository();
      authRepository.deleteAllByUserId.mockResolvedValue(
        Result.err(DBError.create("Internal error")),
      );

      // act
      const useCase = new LogoutAllDevicesUseCase(authRepository);
      const result = await useCase.execute({ userId: "uuid-123" });

      // assert
      expect(result.isErr).toBe(true);
    });
  });
});
