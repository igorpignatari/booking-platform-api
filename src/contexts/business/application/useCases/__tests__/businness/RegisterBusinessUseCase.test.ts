import { makeBusiness } from "@contexts/business/__tests__/factories/entities/makeBusiness";
import { makeRegisterBusinessUseCase } from "@contexts/business/__tests__/factories/useCase/business/makeRegisterBusinessUseCase";

describe("Register business use case", () => {
  describe("success", () => {
    it("should register a business", async () => {
      const { useCase, businessRepository } = makeRegisterBusinessUseCase();

      const result = await useCase.execute(makeBusiness());

      expect(result.isOk).toBe(true);
      expect(result.value.id).toBeDefined();
      expect(result.value.name).toBe("My Business");
      expect(result.value.isActive).toBe(true);
      expect(businessRepository.businesses).toHaveLength(1);
    });

    it("should register a business without optional fields", async () => {
      const { useCase } = makeRegisterBusinessUseCase();

      const result = await useCase.execute(makeBusiness({ email: undefined, taxId: undefined }));

      expect(result.isOk).toBe(true);
      expect(result.value.email).toBeUndefined();
      expect(result.value.taxId).toBeUndefined();
    });

    it("should register a business with optional fields", async () => {
      const { useCase } = makeRegisterBusinessUseCase();
      const result = await useCase.execute(
        makeBusiness({ email: "business@email.com", taxId: "12.345.678/0001-99" }),
      );

      expect(result.isOk).toBe(true);
      expect(result.value.email).toBeDefined();
      expect(result.value.taxId).toBe("12.345.678/0001-99");
    });

    it("should persist the business in the repository", async () => {
      const { useCase, businessRepository } = makeRegisterBusinessUseCase();

      await useCase.execute(makeBusiness());
      await useCase.execute(makeBusiness({ name: "Second Business" }));

      expect(businessRepository.businesses).toHaveLength(2);
    });
  });

  describe("failure", () => {
    it("should return error when category is invalid", async () => {
      const { useCase } = makeRegisterBusinessUseCase();

      const result = await useCase.execute(makeBusiness({ category: "123 invalid!" }));

      expect(result.isErr).toBe(true);
    });

    it("should return error when address is invalid", async () => {
      const { useCase } = makeRegisterBusinessUseCase();

      const result = await useCase.execute(
        makeBusiness({ address: { ...makeBusiness().address, state: "SPP" } }),
      );

      expect(result.isErr).toBe(true);
    });

    it("should return error when email is invalid", async () => {
      const { useCase } = makeRegisterBusinessUseCase();

      const result = await useCase.execute(makeBusiness({ email: "not-an-email" }));

      expect(result.isErr).toBe(true);
    });
  });
});
