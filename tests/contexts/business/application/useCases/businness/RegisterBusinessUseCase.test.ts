import { RegisterBusinessUseCase } from "@contexts/business/application/useCases/business/RegisterBusinessUseCase";
import { BusinessRepositoryInMemory } from "@contexts/business/infra/database/repository/BusinessRepositoryInMemory";

describe("Register business use case", () => {
  test("should be able to register a new business", async () => {
    const businessRepository = new BusinessRepositoryInMemory();
    const registerBusinessUseCase = new RegisterBusinessUseCase(businessRepository);

    const business = await registerBusinessUseCase.execute({
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
    });

    expect(business.isOk).toBeTruthy();
  });
});
