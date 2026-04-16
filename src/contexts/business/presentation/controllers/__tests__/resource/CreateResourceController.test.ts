import { makeResource } from "@contexts/business/__tests__/factories/entities/makeResource";
import type { CreateResourceRequest } from "@contexts/business/application/DTOs/CreateResourceDTO";
import type { ICreateResource } from "@contexts/business/application/ports/input/ICreateResource";
import { Result } from "@core/result/Result";
import { makeHttpRequest } from "@shared/__tests__/factories/controller/makeHttpRequest";
import { CreateResourceController } from "../../resource/CreateResourceController";

const makeUseCase = (): jest.Mocked<ICreateResource> => ({
  execute: jest.fn(),
});

describe("Create resource controller", () => {
  describe("success", () => {
    it("should return a resource", async () => {
      const useCase = makeUseCase();
      const fakeResource = {
        id: "uuid-123",
        name: "My Resource",
        createdAt: new Date(),
      } as any;

      useCase.execute.mockResolvedValue(Result.ok(fakeResource));

      const controller = new CreateResourceController(useCase);

      const response = await controller.handle(
        makeHttpRequest<CreateResourceRequest>(makeResource()),
      );

      expect(response.statusCode).toBe(201);
      expect(response.data).toEqual({
        id: "uuid-123",
        name: "My Resource",
        createdAt: fakeResource.createdAt.toISOString(),
      });
    });

    it("should call use case with the request body", async () => {
      const useCase = makeUseCase();
      useCase.execute.mockResolvedValue(
        Result.ok({ id: "1", name: "My Resource", createdAt: new Date() } as any),
      );

      const controller = new CreateResourceController(useCase);
      const input = makeResource();

      await controller.handle(makeHttpRequest<CreateResourceRequest>(input));

      expect(useCase.execute).toHaveBeenCalledTimes(1);
      expect(useCase.execute).toHaveBeenCalledWith(input);
    });
  });

  describe("failure", () => {
    it("should return 500 when use case returns an error", async () => {
      const useCase = makeUseCase();
      useCase.execute.mockResolvedValue(Result.err(new Error("something went wrong")));

      const controller = new CreateResourceController(useCase);

      const response = await controller.handle(
        makeHttpRequest<CreateResourceRequest>(makeResource()),
      );

      expect(response.statusCode).toBe(500);
    });

    it("should return 500 when use case throws unexpectedly", async () => {
      const useCase = makeUseCase();
      useCase.execute.mockRejectedValue(new Error("unexpected crash"));

      const controller = new CreateResourceController(useCase);

      const response = await controller.handle(
        makeHttpRequest<CreateResourceRequest>(makeResource()),
      );

      expect(response.statusCode).toBe(500);
    });
  });
});
