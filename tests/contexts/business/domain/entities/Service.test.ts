import { Service } from "@contexts/business/domain/entities/Service";

describe("Service entity", () => {
  it("should create a new service", () => {
    const service = Service.create({
      resourceId: "resource id",
      name: "service name",
      duration: 60,
    });
    expect(service.value).toBeInstanceOf(Service);
  });

  it("should create from persistence", () => {
    const service = Service.createFromPersisted({
      id: "service id",
      resourceId: "resource id",
      name: "service name",
      duration: 60,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(service).toBeInstanceOf(Service);
  });
});
