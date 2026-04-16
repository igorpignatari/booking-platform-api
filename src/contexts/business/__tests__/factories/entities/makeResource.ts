import type { TCreateResource } from "@contexts/business/domain/types/TCreateResource";

export const makeResource = (overrides?: Partial<TCreateResource>): TCreateResource => ({
  businessId: "uuid-business",
  name: "resource name",
  ...overrides,
});
