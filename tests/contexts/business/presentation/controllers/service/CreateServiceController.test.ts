import { CreateServiceUseCase } from "@contexts/business/application/useCases/service/CreateServiceUseCase";
import { ServiceRepositoryInMemory } from "@contexts/business/infra/database/repository/ServiceRepositoryInMemory";
import { CreateServiceController } from "@contexts/business/presentation/controllers/service/CreateServiceController";
import { PinoLogger } from "@shared/logger/PinoLogger";

describe("Create service controller", () => {
  it("should create a service", async () => {
    // Arrange
    const logger = PinoLogger.create();
    const repository = new ServiceRepositoryInMemory();
    const useCase = new CreateServiceUseCase(repository);
    const controller = new CreateServiceController(useCase);
    const request = {
      body: {
        resourceId: "1",
        duration: 10,
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
  });
});
