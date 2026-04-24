import { makeUser } from "@contexts/users/__tests__/factories/makeUser";
import type { CreateUserRequest } from "@contexts/users/application/DTOs/createUserDTO";
import type { ICreateUser } from "@contexts/users/application/ports/input/ICreateUser";
import { CreateUserController } from "@contexts/users/presentation/controllers/CreateUserController";
import { Result } from "@core/result/Result";
import { makeHttpRequest } from "@shared/__tests__/factories/controller/makeHttpRequest";
import { DBError } from "@shared/infra/errors/DBError";

const makeUseCaseMock = (): jest.Mocked<ICreateUser> => ({
  execute: jest.fn(),
});

describe("CreateUserController", () => {
  describe("success", () => {
    it("should return 201 with user data when use case succeeds", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      const fakeUser = {
        id: "uuid-123",
        name: "joe doe",
        createdAt: new Date("2024-01-01"),
      } as any;

      useCase.execute.mockResolvedValue(Result.ok(fakeUser));

      const controller = new CreateUserController(useCase);

      // Act
      const response = await controller.handle(makeHttpRequest<CreateUserRequest>(makeUser()));

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.data).toEqual({
        id: "uuid-123",
        name: "joe doe",
        createdAt: fakeUser.createdAt.toISOString(),
      });
    });

    it("should call use case with the request body", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(
        Result.ok({ id: "1", name: "joe doe", createdAt: new Date() } as any),
      );

      const controller = new CreateUserController(useCase);
      const input = makeUser();

      // Act
      await controller.handle(makeHttpRequest<CreateUserRequest>(input));

      // Assert
      expect(useCase.execute).toHaveBeenCalledTimes(1);
      expect(useCase.execute).toHaveBeenCalledWith(input);
    });
  });

  describe("failure", () => {
    it("should return 500 when use case returns an error", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.err(DBError.create("Internal error")));

      const controller = new CreateUserController(useCase);

      // Act
      const response = await controller.handle(makeHttpRequest<CreateUserRequest>(makeUser()));

      // Assert
      expect(response.statusCode).toBe(500);
    });

    it("should return 500 when use case throws unexpectedly", async () => {
      // Arrange
      const useCase = makeUseCaseMock();
      useCase.execute.mockRejectedValue(new Error("unexpected crash"));

      const controller = new CreateUserController(useCase);

      // Act
      const response = await controller.handle(makeHttpRequest<CreateUserRequest>(makeUser()));

      // Assert
      expect(response.statusCode).toBe(500);
    });
  });
});
