import type { RefreshTokenRequest } from "@contexts/auth/application/DTOs/RefreshTokenDTO";
import type { ILogout } from "@contexts/auth/application/ports/input/ILogout";
import { LogoutController } from "@contexts/auth/presentation/controllers/LogoutController";
import { Result } from "@core/result/Result";
import { makeHttpRequest } from "@shared/__tests__/factories/controller/makeHttpRequest";
import { DBError } from "@shared/infra/errors/DBError";

const makeUseCaseMock = (): jest.Mocked<ILogout> => ({ execute: jest.fn() });

describe("Logout controller", () => {
  describe("success", () => {
    //arrange
    it("should return 200 and clear the refreshToken cookie", async () => {
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.ok(undefined));

      //act
      const controller = new LogoutController(useCase);
      const response = await controller.handle(
        makeHttpRequest<RefreshTokenRequest>({ jti: "valid-refresh-token" }),
      );

      //assert
      expect(response.statusCode).toBe(200);
      expect(response.cookies).toEqual([
        expect.objectContaining({
          name: "refreshToken",
          value: "",
          maxAge: 0,
        }),
      ]);
    });

    it("should call use case with request body", async () => {
      //arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.ok(undefined));

      //act
      const controller = new LogoutController(useCase);
      const input = { jti: "valid-refresh-token" };

      await controller.handle(makeHttpRequest<RefreshTokenRequest>(input));

      //assert
      expect(useCase.execute).toHaveBeenCalledWith(input);
    });
  });

  describe("failure", () => {
    it("should return 500 when use case returns error", async () => {
      //arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.err(DBError.create("Internal error")));

      //act
      const controller = new LogoutController(useCase);
      const response = await controller.handle(
        makeHttpRequest<RefreshTokenRequest>({ jti: "bad-token" }),
      );

      //assert
      expect(response.statusCode).toBe(500);
    });

    it("should return 500 when use case throws unexpectedly", async () => {
      //arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockRejectedValue(new Error("unexpected crash"));

      //act
      const controller = new LogoutController(useCase);
      const response = await controller.handle(
        makeHttpRequest<RefreshTokenRequest>({ jti: "any-token" }),
      );

      //assert
      expect(response.statusCode).toBe(500);
    });
  });
});
