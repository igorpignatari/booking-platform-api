import type { RefreshTokenRequest } from "@contexts/auth/application/DTOs/RefreshTokenDTO";
import type { IRefreshToken } from "@contexts/auth/application/ports/input/IRefreshToken";
import { RefreshTokenController } from "@contexts/auth/presentation/controllers/RefreshTokenController";
import { Result } from "@core/result/Result";
import { makeHttpRequest } from "@shared/__tests__/factories/controller/makeHttpRequest";
import { DBError } from "@shared/infra/errors/DBError";

const makeUseCaseMock = (): jest.Mocked<IRefreshToken> => ({ execute: jest.fn() });

describe("Refresh token controller", () => {
  describe("success", () => {
    //arrange
    it("should return 200 with new accessToken in body and new refreshToken in cookie", async () => {
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(
        Result.ok({ accessToken: "new-access-token", refreshToken: "new-refresh-token" }),
      );

      //act
      const controller = new RefreshTokenController(useCase);
      const response = await controller.handle(
        makeHttpRequest<RefreshTokenRequest>({ refreshToken: "old-refresh-token" }),
      );

      //assert
      expect(response.statusCode).toBe(200);
      expect(response.data).toBe("new-access-token");
      expect(response.cookies).toEqual([
        expect.objectContaining({
          name: "refreshToken",
          value: "new-refresh-token",
          httpOnly: true,
          secure: true,
        }),
      ]);
    });

    it("should call use case with request body", async () => {
      //arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(
        Result.ok({ accessToken: "new-access-token", refreshToken: "new-refresh-token" }),
      );

      //act
      const controller = new RefreshTokenController(useCase);
      const input = { refreshToken: "old-refresh-token" };

      await controller.handle(makeHttpRequest<RefreshTokenRequest>(input));

      //assert
      expect(useCase.execute).toHaveBeenCalledWith(input);
    });
  });

  describe("failure", () => {
    it("should return 500 when token is invalid", async () => {
      //arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.err(DBError.create("Internal error")));

      //act
      const controller = new RefreshTokenController(useCase);
      const response = await controller.handle(
        makeHttpRequest<RefreshTokenRequest>({ refreshToken: "bad-token" }),
      );

      //assert
      expect(response.statusCode).toBe(500);
    });

    it("should return 500 when use case throws unexpectedly", async () => {
      //arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockRejectedValue(new Error("unexpected crash"));

      //act
      const controller = new RefreshTokenController(useCase);
      const response = await controller.handle(
        makeHttpRequest<RefreshTokenRequest>({ refreshToken: "any-token" }),
      );

      //assert
      expect(response.statusCode).toBe(500);
    });
  });
});
