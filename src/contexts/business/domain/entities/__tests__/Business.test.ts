import { makeBusiness } from "@contexts/business/__tests__/factories/entities/makeBusiness";
import { Business } from "@contexts/business/domain/entities/Business";

describe("Business entity", () => {
  describe("create", () => {
    it("should create a business with correct data", () => {
      const result = Business.create(makeBusiness());

      expect(result.isOk).toBe(true);
      expect(result.value).toBeInstanceOf(Business);
      expect(result.value.id).toBeDefined();
      expect(result.value.userId).toBe("uuid-123");
      expect(result.value.name).toBe("My Business");
      expect(result.value.isActive).toBe(true);
      expect(result.value.createdAt).toBeInstanceOf(Date);
      expect(result.value.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a business with optional email", () => {
      const result = Business.create(makeBusiness({ email: "business@example.com" }));

      expect(result.isOk).toBe(true);
      expect(result.value.email).toBeDefined();
    });

    it("should create a business with optional taxId", () => {
      const result = Business.create(makeBusiness({ taxId: "12345678000199" }));

      expect(result.isOk).toBe(true);
      expect(result.value.taxId).toBe("12345678000199");
    });

    it("should create a business without optional fields", () => {
      const result = Business.create(makeBusiness({ email: undefined, taxId: undefined }));

      expect(result.isOk).toBe(true);
      expect(result.value.email).toBeUndefined();
      expect(result.value.taxId).toBeUndefined();
    });

    it("should generate unique ids", () => {
      const b1 = Business.create(makeBusiness());
      const b2 = Business.create(makeBusiness());

      expect(b1.value.id).not.toBe(b2.value.id);
    });

    it("should return error for invalid category", () => {
      const result = Business.create(makeBusiness({ category: "invalid-category" }));

      expect(result.isErr).toBe(true);
    });

    it("should return error for invalid email", () => {
      const result = Business.create(makeBusiness({ email: "not-an-email" }));

      expect(result.isErr).toBe(true);
    });

    it("should return error for invalid address", () => {
      const result = Business.create(
        makeBusiness({ address: { ...makeBusiness().address, street: "ab" } }), // street < 3 chars
      );

      expect(result.isErr).toBe(true);
    });
  });

  describe("createFromPersisted", () => {
    it("should restore a business from persistence", () => {
      const now = new Date();
      const business = Business.createFromPersisted({
        id: "uuid-persisted",
        userId: "uuid-123",
        name: "My Business",
        phone: "(11) 99999-9999",
        timezone: "America/Sao_Paulo",
        address: {
          street: "Main Street",
          number: "10",
          neighborhood: "Downtown",
          city: "São Paulo",
          state: "SP",
          country: "Brazil",
          zipCode: "01310100",
        },
        category: "other",
        isActive: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(business).toBeInstanceOf(Business);
      expect(business.id).toBe("uuid-persisted");
      expect(business.isActive).toBe(false);
      expect(business.createdAt).toBe(now);
    });
  });
});
