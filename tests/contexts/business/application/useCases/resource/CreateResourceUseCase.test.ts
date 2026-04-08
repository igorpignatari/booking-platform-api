import { CreateResourceUseCase } from "@contexts/business/application/useCases/resource/CreateResourceUseCase";
import { ResourceRepositoryInMemory } from "@contexts/business/infra/database/repository/ResourceRepositoryInMemory";

describe("Create resource use case", () => {
  it("should create a resource", async () => {
    // Arrange
    const resourceRepositoryInMemory = new ResourceRepositoryInMemory();
    const createResourceUseCase = new CreateResourceUseCase(resourceRepositoryInMemory);
    const resource = {
      businessId: "test-business-id",
      name: "Test resource",
    };

    // Act
    const result = await createResourceUseCase.execute(resource);

    // Assert
    expect(result.value).toEqual({
      id: expect.any(String),
      businessId: resource.businessId,
      name: resource.name,
      isActive: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});
