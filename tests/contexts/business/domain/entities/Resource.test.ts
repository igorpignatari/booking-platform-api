import { Resource } from "@contexts/business/domain/entities/Resource";

describe("Resource entity", () => {
  it("should create a new resource", () => {
    const resource = Resource.create({
      businessId: "business id",
      name: "resource name",
    });

    expect(resource.value).toBeInstanceOf(Resource);
  });

  it("should create from persistence", () => {
    const resource = Resource.createFromPersisted({
      id: "resource id",
      businessId: "business id",
      name: "resource name",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(resource).toBeInstanceOf(Resource);
  });
});
