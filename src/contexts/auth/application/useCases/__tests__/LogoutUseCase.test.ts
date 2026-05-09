import { makeRefreshToken } from "@contexts/auth/__tests__/factories/makeRefreshToken";
import { AuthRepositoryInMemory } from "@contexts/auth/__tests__/inMemory/AuthRepositoryInMemory";
import { makeMockAuthRepository } from "@contexts/auth/__tests__/mocks/makeMockAuthRepository";
import { LogoutUseCase } from "@contexts/auth/application/useCases/LogoutUseCase";
import { Result } from "@core/result/Result";
import { DBError } from "@shared/infra/errors/DBError";

describe("LogoutUseCase", () => {
  describe("success", () => {
    it("should revoke the refresh token", async () => {
      // arrange
      const authRepository = new AuthRepositoryInMemory();

      const refreshToken = makeRefreshToken({
        id: "token-1",
      });

      await authRepository.save(refreshToken);

      // act
      const useCase = new LogoutUseCase(authRepository);

      const result = await useCase.execute({
        jti: refreshToken.id,
      });

      // assert
      expect(result.isOk).toBe(true);

      const found = await authRepository.findByJti(refreshToken.id);

      expect(found.value).not.toBeNull();
      expect(found.value?.isRevoked()).toBe(true);
    });
  });

  describe("failure", () => {
    it("should return error when repository fails", async () => {
      // arrange
      const authRepository = makeMockAuthRepository();

      authRepository.revoke.mockResolvedValue(Result.err(DBError.create("Internal error")));

      // act
      const useCase = new LogoutUseCase(authRepository);

      const result = await useCase.execute({
        jti: "token-1",
      });

      // assert
      expect(result.isErr).toBe(true);
    });
  });
});
