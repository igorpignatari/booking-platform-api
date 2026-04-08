import { CreateResourceUseCase } from "@contexts/business/application/useCases/resource/CreateResourceUseCase";
import { ResourceRepositoryInMemory } from "@contexts/business/infra/database/repository/ResourceRepositoryInMemory";
import { CreateResourceController } from "@contexts/business/presentation/controllers/resource/CreateResourceController";
import { PinoLogger } from "@shared/logger/PinoLogger";

describe("Create resource controller", () => {
  it("should create a resource", async () => {
    // Arrange
    const logger = PinoLogger.create();
    const repository = new ResourceRepositoryInMemory();
    const useCase = new CreateResourceUseCase(repository);
    const controller = new CreateResourceController(useCase);
    const request = {
      body: {
        businessId: "test",
        name: "test",
      },
      params: null,
      query: null,
      correlationId: "1",
      logger: logger,
    };

    // Act
    const result = await controller.handle(request);

    // Assert
    expect(result.statusCode).toBe(201);
    expect(result.data).toHaveProperty("id");
  });
});
