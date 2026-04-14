import { makeResource } from "@contexts/business/__tests__/factories/entities/makeResource";
import { Resource } from "@contexts/business/domain/entities/Resource";

describe("Resource entity", () => {
  describe("create", () => {
    it("should create a resource with correct data", () => {
      const result = Resource.create(makeResource());

      expect(result.isOk).toBe(true);
      expect(result.value).toBeInstanceOf(Resource);
      expect(result.value.id).toBeDefined();
      expect(result.value.businessId).toBe("uuid-business");
      expect(result.value.name).toBe("Resource Name");
      expect(result.value.isActive).toBe(true);
      expect(result.value.createdAt).toBeInstanceOf(Date);
      expect(result.value.updatedAt).toBeInstanceOf(Date);
    });

    it("should generate unique ids", () => {
      const r1 = Resource.create(makeResource());
      const r2 = Resource.create(makeResource());

      expect(r1.value.id).not.toBe(r2.value.id);
    });

    it("should return error when name is missing", () => {
      const result = Resource.create(makeResource({ name: "" }));

      expect(result.isErr).toBe(true);
    });

    it("should return error when businessId is missing", () => {
      const result = Resource.create(makeResource({ businessId: "" }));

      expect(result.isErr).toBe(true);
    });

    it("should return error when both name and businessId are missing", () => {
      const result = Resource.create(makeResource({ name: "", businessId: "" }));

      expect(result.isErr).toBe(true);
    });
  });

  describe("createFromPersisted", () => {
    it("should restore a resource from persistence", () => {
      const now = new Date();
      const resource = Resource.createFromPersisted({
        id: "uuid-persisted",
        businessId: "uuid-business",
        name: "Resource Name",
        isActive: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(resource).toBeInstanceOf(Resource);
      expect(resource.id).toBe("uuid-persisted");
      expect(resource.isActive).toBe(false);
      expect(resource.createdAt).toBe(now);
    });
  });
});
