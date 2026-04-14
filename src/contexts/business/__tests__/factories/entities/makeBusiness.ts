import type { TCreateBusiness } from "@contexts/business/domain/types/TCreateBusiness";

export const makeBusiness = (overrides?: Partial<TCreateBusiness>): TCreateBusiness => ({
  userId: "uuid-123",
  name: "My Business",
  phone: "(11) 99999-9999",
  timezone: "America/Sao_Paulo",
  address: {
    street: "Main Street",
    number: "10",
    neighborhood: "Downtown",
    city: "São Paulo",
    state: "SP",
    country: "Brazil",
    zipCode: "01310100",
  },
  category: "other",
  ...overrides,
});
