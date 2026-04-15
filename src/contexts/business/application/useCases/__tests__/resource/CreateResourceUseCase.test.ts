import { makeCreateResourceUseCase } from "@contexts/business/__tests__/factories/useCase/resource/makeCreateResourceUseCase";
import { seedBusiness } from "@contexts/business/__tests__/inMemory/seeds/seedBusiness";

describe("Create resource use case", () => {
  describe("success", () => {
    it("should create a resource for an existing business", async () => {
      const { useCase, businessRepo } = makeCreateResourceUseCase();
      const business = await seedBusiness(businessRepo);

      const result = await useCase.execute({ businessId: business.id, name: "chair 1" });

      expect(result.isOk).toBe(true);
      expect(result.value).toBeInstanceOf(Object);
      expect(result.value.id).toBeDefined();
      expect(result.value.businessId).toBe(business.id);
      expect(result.value.name).toBe("chair 1");
      expect(result.value.isActive).toBe(true);
    });

    it("should persist the resource in the repository", async () => {
      const { useCase, businessRepo, resourceRepo } = makeCreateResourceUseCase();
      const business = await seedBusiness(businessRepo);

      await useCase.execute({ businessId: business.id, name: "chair 1" });
      await useCase.execute({ businessId: business.id, name: "chair 2" });

      expect(resourceRepo.resources).toHaveLength(2);
    });
  });

  describe("failure", () => {
    it("should return error when business does not exist", async () => {
      const { useCase } = makeCreateResourceUseCase();

      const result = await useCase.execute({ businessId: "non-existent-id", name: "chair 1" });

      expect(result.isErr).toBe(true);
    });

    it("should return BUSINESS_NOT_FOUND error", async () => {
      const { useCase } = makeCreateResourceUseCase();

      const result = await useCase.execute({ businessId: "non-existent-id", name: "chair 1" });

      expect((result.error as any).code).toBe("BUSINESS_NOT_FOUND");
    });
  });
});
