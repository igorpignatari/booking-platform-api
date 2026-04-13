import { makeRefreshToken } from "@contexts/auth/__tests__/factories/makeRefreshToken";
import { AuthRepositoryInMemory } from "@contexts/auth/__tests__/inMemory/AuthRepositoryInMemory";
import { makeMockAuthRepository } from "@contexts/auth/__tests__/mocks/makeMockeAuthRepository";
import { LogoutUseCase } from "@contexts/auth/application/useCases/LogoutUseCase";
import { Result } from "@core/result/Result";

describe("Logout use  case", () => {
  describe("success", () => {
    it("should delete the refresh token", async () => {
      //arrange
      const authRepository = new AuthRepositoryInMemory();
      const refreshToken = makeRefreshToken();

      await authRepository.save(refreshToken);

      //act
      const useCase = new LogoutUseCase(authRepository);
      const result = await useCase.execute({ refreshToken: refreshToken.token });

      //assert
      expect(result.isOk).toBe(true);

      const found = await authRepository.findByRefreshToken(refreshToken.token);
      expect(found.value).toBeNull();
    });
  });

  describe("failure", () => {
    it("should return error when repository fails", async () => {
      //arrange
      const authRepository = makeMockAuthRepository();
      authRepository.delete.mockResolvedValue(Result.err(new Error("DB error")));

      //act
      const useCase = new LogoutUseCase(authRepository);
      const result = await useCase.execute({ refreshToken: "any-token" });

      //assert
      expect(result.isErr).toBe(true);
    });
  });
});
