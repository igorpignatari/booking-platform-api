import { Business } from "@contexts/business/domain/entities/Business";

describe("Business entity", () => {
  it("should register a new business", () => {
    const business = Business.create({
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

    expect(business.value).toBeInstanceOf(Business);
  });

  it("should create from persistence", () => {
    const business = Business.createFromPersisted({
      id: "business id",
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
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: "other",
      taxId: "tax id",
    });
    expect(business).toBeInstanceOf(Business);
  });
});
