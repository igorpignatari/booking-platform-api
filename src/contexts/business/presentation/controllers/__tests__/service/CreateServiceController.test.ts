import { makeService } from "@contexts/business/__tests__/factories/entities/makeService";
import type { CreateServiceRequest } from "@contexts/business/application/DTOs/CreateServiceDTO";
import type { ICreateService } from "@contexts/business/application/ports/input/ICreateService";
import { Result } from "@core/result/Result";
import { makeHttpRequest } from "@shared/__tests__/factories/controller/makeHttpRequest";
import { CreateServiceController } from "../../service/CreateServiceController";

const makeUseCase = (): jest.Mocked<ICreateService> => ({
  execute: jest.fn(),
});

describe("Create service controller", () => {
  describe("success", () => {
    it("should return a service", async () => {
      const useCase = makeUseCase();

      const fakeService = {
        id: "1",
        name: "My Service",
        createdAt: new Date(),
      } as any;

      useCase.execute.mockResolvedValue(Result.ok(fakeService));

      const controller = new CreateServiceController(useCase);
      const response = await controller.handle(
        makeHttpRequest<CreateServiceRequest>(makeService()),
      );

      expect(response.statusCode).toBe(201);
      expect(response.data).toEqual({
        id: "1",
        name: "My Service",
        createdAt: fakeService.createdAt.toISOString(),
      });
    });

    it("should call use case with the request body", async () => {
      const useCase = makeUseCase();
      useCase.execute.mockResolvedValue({
        id: "1",
        name: "My Service",
        createdAt: new Date(),
      } as any);

      const controller = new CreateServiceController(useCase);
      const input = makeService();

      await controller.handle(makeHttpRequest<CreateServiceRequest>(input));

      expect(useCase.execute).toHaveBeenCalledTimes(1);
      expect(useCase.execute).toHaveBeenCalledWith(input);
    });
  });

  describe("failure", () => {
    it("should return 500 when use case returns an error", async () => {
      const useCase = makeUseCase();
      useCase.execute.mockResolvedValue(Result.err(new Error("something went wrong")));

      const controller = new CreateServiceController(useCase);

      const response = await controller.handle(
        makeHttpRequest<CreateServiceRequest>(makeService()),
      );

      expect(response.statusCode).toBe(500);
    });

    it("should return 500 when use case throws unexpectedly", async () => {
      const useCase = makeUseCase();
      useCase.execute.mockRejectedValue(new Error("unexpected crash"));

      const controller = new CreateServiceController(useCase);

      const response = await controller.handle(
        makeHttpRequest<CreateServiceRequest>(makeService()),
      );

      expect(response.statusCode).toBe(500);
    });
  });
});
