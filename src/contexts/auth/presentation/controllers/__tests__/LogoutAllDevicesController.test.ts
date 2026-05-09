import type { LogoutRequest } from "@contexts/auth/application/DTOs/LogoutDTO";
import type { ILogoutAllDevices } from "@contexts/auth/application/ports/input/ILogoutAllDevices";
import { LogoutAllDevicesController } from "@contexts/auth/presentation/controllers/LogoutAllDevicesController";
import { Result } from "@core/result/Result";
import { makeHttpRequest } from "@shared/__tests__/factories/controller/makeHttpRequest";
import { DBError } from "@shared/infra/errors/DBError";

const makeUseCaseMock = (): jest.Mocked<ILogoutAllDevices> => ({ execute: jest.fn() });

describe("LogoutAllDevicesController", () => {
  describe("success", () => {
    it("should return 200 and clear the refreshToken cookie", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.ok(undefined));

      // Act
      const controller = new LogoutAllDevicesController(useCase);
      const response = await controller.handle(
        makeHttpRequest<LogoutRequest>({ jti: "valid-jti" }),
      );

      // Assert
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
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.ok(undefined));

      // Act
      const controller = new LogoutAllDevicesController(useCase);
      const input: LogoutRequest = { jti: "valid-jti" };

      await controller.handle(makeHttpRequest<LogoutRequest>(input));

      // Assert
      expect(useCase.execute).toHaveBeenCalledTimes(1);
      expect(useCase.execute).toHaveBeenCalledWith(input);
    });
  });

  describe("failure", () => {
    it("should return 500 when use case returns error", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.err(DBError.create("Internal error")));

      // Act
      const controller = new LogoutAllDevicesController(useCase);
      const response = await controller.handle(makeHttpRequest<LogoutRequest>({ jti: "any-jti" }));

      // Assert
      expect(response.statusCode).toBe(500);
    });

    it("should return 500 when use case throws unexpectedly", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockRejectedValue(new Error("unexpected crash"));

      // Act
      const controller = new LogoutAllDevicesController(useCase);
      const response = await controller.handle(makeHttpRequest<LogoutRequest>({ jti: "any-jti" }));

      // Assert
      expect(response.statusCode).toBe(500);
    });
  });
});
