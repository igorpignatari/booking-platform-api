import { makeCreateServiceUseCase } from "@contexts/business/__tests__/factories/useCase/service/makeCreateServiceUseCase";
import { seedBusiness } from "@contexts/business/__tests__/inMemory/seeds/seedBusiness";
import { seedResource } from "@contexts/business/__tests__/inMemory/seeds/seedResource";

describe("CreateServiceUseCase", () => {
  describe("success", () => {
    it("should create a service for an existing resource", async () => {
      const { useCase, businessRepo, resourceRepo } = makeCreateServiceUseCase();
      const business = await seedBusiness(businessRepo);
      const resource = await seedResource(business.id, businessRepo, resourceRepo);

      const result = await useCase.execute({
        resourceId: resource.id,
        name: "Hair cut",
        duration: 30,
      });

      expect(result.isOk).toBe(true);
      expect(result.value.id).toBeDefined();
      expect(result.value.resourceId).toBe(resource.id);
      expect(result.value.name).toBe("Hair cut");
      expect(result.value.duration).toBe(30);
      expect(result.value.isActive).toBe(true);
    });

    it("should persist the service in the repository", async () => {
      const { useCase, businessRepo, resourceRepo, serviceRepo } = makeCreateServiceUseCase();
      const business = await seedBusiness(businessRepo);
      const resource = await seedResource(business.id, businessRepo, resourceRepo);

      await useCase.execute({ resourceId: resource.id, name: "Hair cut", duration: 30 });
      await useCase.execute({ resourceId: resource.id, name: "Beard cut", duration: 20 });

      expect(serviceRepo.services).toHaveLength(2);
    });
  });

  describe("failure", () => {
    it("should return error when resource does not exist", async () => {
      const { useCase } = makeCreateServiceUseCase();

      const result = await useCase.execute({
        resourceId: "non-existent-id",
        name: "Hair cut",
        duration: 30,
      });

      expect(result.isErr).toBe(true);
    });

    it("should return RESOURCE_NOT_FOUND error", async () => {
      const { useCase } = makeCreateServiceUseCase();

      const result = await useCase.execute({
        resourceId: "non-existent-id",
        name: "Hair cut",
        duration: 30,
      });

      expect((result.error as any).code).toBe("RESOURCE_NOT_FOUND");
    });
  });
});
