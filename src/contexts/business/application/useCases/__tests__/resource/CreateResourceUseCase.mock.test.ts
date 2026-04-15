import { makeResource } from "@contexts/business/__tests__/factories/entities/makeResource";
import { makeCreateResourceUseCase } from "@contexts/business/__tests__/factories/useCase/resource/makeCreateResourceUseCase";
import { makeMockBusinessRepository } from "@contexts/business/__tests__/mocks/makeMockBusinessRepository";
import { makeMockResourceRepository } from "@contexts/business/__tests__/mocks/makeMockCreateResourceRepository";
import { Result } from "@core/result/Result";

describe("Create resource use case (mokc)", () => {
  describe("Sucess", () => {
    it("it should create a resource", async () => {
      const resourceRepository = makeMockResourceRepository();
      const businessRepository = makeMockBusinessRepository();
      const resource = makeResource();

      const existingBusiness = { id: resource.businessId } as any;

      resourceRepository.save.mockResolvedValue(Result.ok());
      resourceRepository.findById.mockResolvedValue(Result.ok(null));
      businessRepository.save.mockResolvedValue(Result.ok());
      businessRepository.findById.mockResolvedValue(Result.ok(existingBusiness));

      const { useCase } = makeCreateResourceUseCase({ resourceRepository, businessRepository });

      const result = await useCase.execute({
        businessId: resource.businessId,
        name: resource.name,
      });

      expect(result.isOk).toBe(true);
      expect(result.value).toBeDefined();
      expect(businessRepository.findById).toHaveBeenCalledTimes(1);
      expect(businessRepository.findById).toHaveBeenCalledWith(resource.businessId);
      expect(resourceRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("Failure", () => {
    it("it should return error when save fails", async () => {
      const resourceRepository = makeMockResourceRepository();
      const businessRepository = makeMockBusinessRepository();
      const resource = makeResource();

      const existingBusiness = { id: resource.businessId } as any;

      resourceRepository.save.mockResolvedValue(Result.err(new Error("DB error")));
      resourceRepository.findById.mockResolvedValue(Result.ok(null));
      businessRepository.save.mockResolvedValue(Result.ok());
      businessRepository.findById.mockResolvedValue(Result.ok(existingBusiness));

      const { useCase } = makeCreateResourceUseCase({ resourceRepository, businessRepository });

      const result = await useCase.execute({
        businessId: resource.businessId,
        name: resource.name,
      });

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(Error);
      expect(businessRepository.findById).toHaveBeenCalledTimes(1);
      expect(businessRepository.findById).toHaveBeenCalledWith(resource.businessId);
      expect(resourceRepository.save).toHaveBeenCalledTimes(1);
    });

    it("it should return error when business not found", async () => {
      const resourceRepository = makeMockResourceRepository();
      const businessRepository = makeMockBusinessRepository();
      const resource = makeResource();

      resourceRepository.save.mockResolvedValue(Result.ok());
      resourceRepository.findById.mockResolvedValue(Result.ok(null));
      businessRepository.save.mockResolvedValue(Result.ok());
      businessRepository.findById.mockResolvedValue(Result.ok(null));

      const { useCase } = makeCreateResourceUseCase({ resourceRepository, businessRepository });

      const result = await useCase.execute({
        businessId: resource.businessId,
        name: resource.name,
      });

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(Error);
      expect(businessRepository.findById).toHaveBeenCalledTimes(1);
      expect(businessRepository.findById).toHaveBeenCalledWith(resource.businessId);
    });
  });
});
