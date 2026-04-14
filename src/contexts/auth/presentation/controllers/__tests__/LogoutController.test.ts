import { makeHttpRequest } from "@contexts/auth/__tests__/factories/controller/makeHttpRequest";
import type { RefreshTokenRequest } from "@contexts/auth/application/DTOs/RefreshTokenDTO";
import type { ILogout } from "@contexts/auth/application/ports/input/ILogout";
import { LogoutController } from "@contexts/auth/presentation/controllers/LogoutController";
import { Result } from "@core/result/Result";

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
        makeHttpRequest<RefreshTokenRequest>({ refreshToken: "valid-refresh-token" }),
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
      const input = { refreshToken: "valid-refresh-token" };

      await controller.handle(makeHttpRequest<RefreshTokenRequest>(input));

      //assert
      expect(useCase.execute).toHaveBeenCalledWith(input);
    });
  });

  describe("failure", () => {
    it("should return 500 when use case returns error", async () => {
      //arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.err(new Error("token not found")));

      //act
      const controller = new LogoutController(useCase);
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
      const controller = new LogoutController(useCase);
      const response = await controller.handle(
        makeHttpRequest<RefreshTokenRequest>({ refreshToken: "any-token" }),
      );

      //assert
      expect(response.statusCode).toBe(500);
    });
  });
});
