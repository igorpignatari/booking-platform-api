import { makeService } from "@contexts/business/__tests__/factories/entities/makeService";
import { makeCreateServiceUseCase } from "@contexts/business/__tests__/factories/useCase/service/makeCreateServiceUseCase";
import { makeMockResourceRepository } from "@contexts/business/__tests__/mocks/makeMockCreateResourceRepository";
import { makeMockServiceRepository } from "@contexts/business/__tests__/mocks/makeMockCreateServiceRepository";
import { Result } from "@core/result/Result";

describe("Create service use case (mock)", () => {
  describe("Sucess", () => {
    it("it should create a service", async () => {
      const serviceRepository = makeMockServiceRepository();
      const resourceRepository = makeMockResourceRepository();

      const service = makeService();
      const existingResource = { id: service.resourceId } as any;

      serviceRepository.save.mockResolvedValue(Result.ok());
      resourceRepository.save.mockResolvedValue(Result.ok());
      resourceRepository.findById.mockResolvedValue(Result.ok(existingResource));

      const { useCase } = makeCreateServiceUseCase({ serviceRepository, resourceRepository });

      const result = await useCase.execute({
        resourceId: service.resourceId,
        name: service.name,
        duration: service.duration,
      });

      expect(result.isOk).toBe(true);
      expect(result.value).toBeDefined();
      expect(serviceRepository.save).toHaveBeenCalledTimes(1);
      expect(resourceRepository.findById).toHaveBeenCalledTimes(1);
      expect(resourceRepository.findById).toHaveBeenCalledWith(service.resourceId);
    });
  });

  describe("Failure", () => {
    it("it should return error when save fails", async () => {
      const serviceRepository = makeMockServiceRepository();
      const resourceRepository = makeMockResourceRepository();

      const service = makeService();
      const existingResource = { id: service.resourceId } as any;

      serviceRepository.save.mockResolvedValue(Result.err(new Error("DB error")));
      resourceRepository.save.mockResolvedValue(Result.ok());
      resourceRepository.findById.mockResolvedValue(Result.ok(existingResource));

      const { useCase } = makeCreateServiceUseCase({ serviceRepository, resourceRepository });

      const result = await useCase.execute({
        resourceId: service.resourceId,
        name: service.name,
        duration: service.duration,
      });

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(Error);
      expect(serviceRepository.save).toHaveBeenCalledTimes(1);
      expect(resourceRepository.findById).toHaveBeenCalledTimes(1);
      expect(resourceRepository.findById).toHaveBeenCalledWith(service.resourceId);
    });

    it("it should return error when resource not found", async () => {
      const serviceRepository = makeMockServiceRepository();
      const resourceRepository = makeMockResourceRepository();

      const service = makeService();

      serviceRepository.save.mockResolvedValue(Result.ok());
      resourceRepository.save.mockResolvedValue(Result.ok());
      resourceRepository.findById.mockResolvedValue(Result.ok(null));

      const { useCase } = makeCreateServiceUseCase({ serviceRepository, resourceRepository });

      const result = await useCase.execute({
        resourceId: service.resourceId,
        name: service.name,
        duration: service.duration,
      });

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(Error);
      expect(resourceRepository.findById).toHaveBeenCalledTimes(1);
      expect(resourceRepository.findById).toHaveBeenCalledWith(service.resourceId);
    });
  });
});
