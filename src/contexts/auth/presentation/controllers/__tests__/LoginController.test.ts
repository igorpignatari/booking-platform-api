import type { LoginRequest } from "@contexts/auth/application/DTOs/LoginDTO";
import type { ILogin } from "@contexts/auth/application/ports/input/ILogin";
import { LoginController } from "@contexts/auth/presentation/controllers/LoginController";
import { Result } from "@core/result/Result";
import { makeHttpRequest } from "@shared/__tests__/factories/controller/makeHttpRequest";

const makeUseCaseMock = (): jest.Mocked<ILogin> => ({ execute: jest.fn() });

describe("Login controller", () => {
  describe("success", () => {
    //arrange
    it("should return 200 with accessToken in body and refreshToken in cookie", async () => {
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(
        Result.ok({ accessToken: "access-token", refreshToken: "refresh-token" }),
      );

      //act
      const controller = new LoginController(useCase);
      const response = await controller.handle(
        makeHttpRequest<LoginRequest>({ email: "joe@example.com", password: "@Password123" }),
      );

      //assert
      expect(response.statusCode).toBe(200);
      expect(response.data).toBe("access-token");
      expect(response.cookies).toEqual([
        expect.objectContaining({
          name: "refreshToken",
          value: "refresh-token",
          httpOnly: true,
          secure: true,
        }),
      ]);
    });

    it("should call use case with request body", async () => {
      //arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(
        Result.ok({ accessToken: "access-token", refreshToken: "refresh-token" }),
      );

      //act
      const controller = new LoginController(useCase);
      const input = { email: "joe@example.com", password: "@Password123" };

      await controller.handle(makeHttpRequest<LoginRequest>(input));

      //assert
      expect(useCase.execute).toHaveBeenCalledTimes(1);
      expect(useCase.execute).toHaveBeenCalledWith(input);
    });
  });

  describe("failure", () => {
    it("should return 500 when use case returns error", async () => {
      //arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.err(new Error("invalid credentials")));

      //act
      const controller = new LoginController(useCase);
      const response = await controller.handle(
        makeHttpRequest<LoginRequest>({ email: "joe@example.com", password: "wrong" }),
      );

      //assert
      expect(response.statusCode).toBe(500);
    });

    it("should return 500 when use case throws unexpectedly", async () => {
      //arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockRejectedValue(new Error("unexpected crash"));

      //act
      const controller = new LoginController(useCase);
      const response = await controller.handle(
        makeHttpRequest<LoginRequest>({ email: "joe@example.com", password: "@Password123" }),
      );

      //assert
      expect(response.statusCode).toBe(500);
    });
  });
});
