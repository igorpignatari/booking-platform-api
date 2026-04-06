import { RegisterBusinessUseCase } from "@contexts/business/application/useCases/business/RegisterBusinessUseCase";
import { BusinessRepositoryInMemory } from "@contexts/business/infra/database/repository/BusinessRepositoryInMemory";
import { RegisterBusinessController } from "@contexts/business/presentation/controllers/RegisterBusinessController";
import { PinoLogger } from "@shared/logger/PinoLogger";

describe("Register business controller", () => {
  it("should register a business", async () => {
    const logger = PinoLogger.create();
    const repo = new BusinessRepositoryInMemory();
    const useCase = new RegisterBusinessUseCase(repo);
    const controller = new RegisterBusinessController(useCase);

    const request = {
      userId: "user id",
      name: "business name",
      phone: "(11) 99999-9999",
      timezone: "America/Sao_Paulo",
      address: {
        street: "street",
        number: "1",
        neighborhood: "neighborhood",
        city: "city",
        state: "st",
        country: "country",
        zipCode: "zip code",
        complement: "complement",
      },
      category: "other",
      taxId: "tax id",
    };

    const response = await controller.handle({
      body: request,
      params: null,
      query: null,
      correlationId: "1",
      logger: logger,
    });
    expect(response.statusCode).toBe(201);
    expect(response.data).toBeInstanceOf(Object);
    expect(response.data).toHaveProperty("id");
  });
});
