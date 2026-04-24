import { makeBusiness } from "@contexts/business/__tests__/factories/entities/makeBusiness";
import type { RegisterBusinessRequest } from "@contexts/business/application/DTOs/RegisterBusinessDTO";
import type { IRegisterBusiness } from "@contexts/business/application/ports/input/IRegisterBusiness";
import { Result } from "@core/result/Result";
import { makeHttpRequest } from "@shared/__tests__/factories/controller/makeHttpRequest";
import { DBError } from "@shared/infra/errors/DBError";
import { RegisterBusinessController } from "../../business/RegisterBusinessController";

const makeUseCaseMock = (): jest.Mocked<IRegisterBusiness> => ({
  execute: jest.fn(),
});

describe("Register business controller", () => {
  describe("success", () => {
    it("should register a business", async () => {
      const useCase = makeUseCaseMock();
      const fakeBusiness = {
        id: "uuid-123",
        name: "My Business",
        createdAt: new Date(),
      } as any;

      useCase.execute.mockResolvedValue(Result.ok(fakeBusiness));

      const controller = new RegisterBusinessController(useCase);

      const response = await controller.handle(
        makeHttpRequest<RegisterBusinessRequest>(makeBusiness()),
      );

      expect(response.statusCode).toBe(201);
      expect(response.data).toEqual({
        id: "uuid-123",
        name: "My Business",
        createdAt: fakeBusiness.createdAt.toISOString(),
      });
    });

    it("should call use case with the request body", async () => {
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(
        Result.ok({ id: "1", name: "My Business", createdAt: new Date() } as any),
      );

      const controller = new RegisterBusinessController(useCase);
      const input = makeBusiness();

      await controller.handle(makeHttpRequest<RegisterBusinessRequest>(input));

      expect(useCase.execute).toHaveBeenCalledTimes(1);
      expect(useCase.execute).toHaveBeenCalledWith(input);
    });
  });

  describe("failure", () => {
    it("should return 500 when use case returns an error", async () => {
      const useCase = makeUseCaseMock();
      useCase.execute.mockResolvedValue(Result.err(DBError.create("Internal error")));

      const controller = new RegisterBusinessController(useCase);

      const response = await controller.handle(
        makeHttpRequest<RegisterBusinessRequest>(makeBusiness()),
      );

      expect(response.statusCode).toBe(500);
    });

    it("should return 500 when use case throws unexpectedly", async () => {
      const useCase = makeUseCaseMock();
      useCase.execute.mockRejectedValue(new Error("unexpected crash"));

      const controller = new RegisterBusinessController(useCase);

      const response = await controller.handle(
        makeHttpRequest<RegisterBusinessRequest>(makeBusiness()),
      );

      expect(response.statusCode).toBe(500);
    });
  });
});
