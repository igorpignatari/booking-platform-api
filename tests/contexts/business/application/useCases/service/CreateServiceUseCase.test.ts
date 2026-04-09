import { CreateServiceUseCase } from "@contexts/business/application/useCases/service/CreateServiceUseCase";
import { ServiceRepositoryInMemory } from "@contexts/business/infra/database/repository/ServiceRepositoryInMemory";

describe("Create service use case", () => {
  it("should create a service", async () => {
    // Arrange
    const repository = new ServiceRepositoryInMemory();
    const useCase = new CreateServiceUseCase(repository);

    // Act
    const result = await useCase.execute({
      resourceId: "1",
      name: "Test",
      duration: 10,
    });

    // Assert
    expect(result.isOk).toBe(true);
    expect(result.value.name).toBe("Test");
    expect(result.value.resourceId).toBe("1");
    expect(result.value.duration).toBe(10);
    expect(result.value.isActive).toBe(true);
  });
});
