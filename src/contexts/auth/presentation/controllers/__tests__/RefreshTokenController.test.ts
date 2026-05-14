import type { IRefreshToken } from "@contexts/auth/application/ports/input/IRefreshToken";
import { RefreshTokenController } from "@contexts/auth/presentation/controllers/RefreshTokenController";
import { Result } from "@core/result/Result";
import { makeHttpRequest } from "@shared/__tests__/factories/controller/makeHttpRequest";
import { DBError } from "@shared/infra/errors/DBError";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";

const makeUseCaseMock = (): jest.Mocked<IRefreshToken> => ({ execute: jest.fn() });

const makeRequestWithCookie = (refreshToken?: string): HttpRequest => ({
  ...makeHttpRequest({}),
  ...(refreshToken !== undefined && { cookies: { refreshToken } }),
});

describe("RefreshTokenController", () => {
  describe("success", () => {
    it("should return 200 with new accessToken in body and new refreshToken in cookie", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(
        Result.ok({ accessToken: "new-access-token", refreshToken: "new-refresh-token" }),
      );

      const controller = new RefreshTokenController(useCase);

      // Act
      const response = await controller.handle(makeRequestWithCookie("valid-refresh-token"));

      // Assert
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

    it("should call use case with the refreshToken from cookies", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(
        Result.ok({ accessToken: "new-access-token", refreshToken: "new-refresh-token" }),
      );

      const controller = new RefreshTokenController(useCase);

      // Act
      await controller.handle(makeRequestWithCookie("valid-refresh-token"));

      // Assert
      expect(useCase.execute).toHaveBeenCalledTimes(1);
      expect(useCase.execute).toHaveBeenCalledWith({ refreshToken: "valid-refresh-token" });
    });
  });

  describe("failure", () => {
    it("should return 401 when refreshToken cookie is missing", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      const controller = new RefreshTokenController(useCase);

      // Act
      const response = await controller.handle(makeRequestWithCookie(undefined));

      // Assert
      expect(response.statusCode).toBe(401);
      expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return 401 when cookies object is absent", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      const controller = new RefreshTokenController(useCase);

      // Act
      const response = await controller.handle(makeHttpRequest({}));

      // Assert
      expect(response.statusCode).toBe(401);
      expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return 500 when use case returns error", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.err(DBError.create("Internal error")));

      const controller = new RefreshTokenController(useCase);

      // Act
      const response = await controller.handle(makeRequestWithCookie("valid-refresh-token"));

      // Assert
      expect(response.statusCode).toBe(500);
    });

    it("should return 500 when use case throws unexpectedly", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockRejectedValue(new Error("unexpected crash"));

      const controller = new RefreshTokenController(useCase);

      // Act
      const response = await controller.handle(makeRequestWithCookie("valid-refresh-token"));

      // Assert
      expect(response.statusCode).toBe(500);
    });
  });
});
