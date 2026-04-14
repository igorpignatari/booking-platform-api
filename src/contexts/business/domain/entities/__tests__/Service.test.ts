import { makeService } from "@contexts/business/__tests__/factories/entities/makeService";
import { Service } from "@contexts/business/domain/entities/Service";

describe("Service entity", () => {
  describe("create", () => {
    it("should create a service with correct data", () => {
      const result = Service.create(makeService());

      expect(result.isOk).toBe(true);
      expect(result.value).toBeInstanceOf(Service);
      expect(result.value.id).toBeDefined();
      expect(result.value.resourceId).toBe("uuid-resource");
      expect(result.value.name).toBe("Service Name");
      expect(result.value.duration).toBe(60);
      expect(result.value.isActive).toBe(true);
      expect(result.value.createdAt).toBeInstanceOf(Date);
      expect(result.value.updatedAt).toBeInstanceOf(Date);
    });

    it("should generate unique ids", () => {
      const s1 = Service.create(makeService());
      const s2 = Service.create(makeService());

      expect(s1.value.id).not.toBe(s2.value.id);
    });

    it("should return error when name is missing", () => {
      const result = Service.create(makeService({ name: "" }));

      expect(result.isErr).toBe(true);
    });

    it("should return error when resourceId is missing", () => {
      const result = Service.create(makeService({ resourceId: "" }));

      expect(result.isErr).toBe(true);
    });

    it("should return error when duration is missing", () => {
      const result = Service.create(makeService({ duration: 0 }));

      expect(result.isErr).toBe(true);
    });

    it("should return error when all fields are missing", () => {
      const result = Service.create(makeService({ name: "", resourceId: "", duration: 0 }));

      expect(result.isErr).toBe(true);
    });
  });

  describe("createFromPersisted", () => {
    it("should restore a service from persistence", () => {
      const now = new Date();
      const service = Service.createFromPersisted({
        id: "uuid-persisted",
        resourceId: "uuid-resource",
        name: "Service Name",
        duration: 30,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(service).toBeInstanceOf(Service);
      expect(service.id).toBe("uuid-persisted");
      expect(service.duration).toBe(30);
      expect(service.isActive).toBe(false);
      expect(service.createdAt).toBe(now);
    });
  });
});
