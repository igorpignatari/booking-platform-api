import type { TCreateService } from "@contexts/business/domain/types/TCreateService";

export const makeService = (overrides?: Partial<TCreateService>): TCreateService => ({
  resourceId: "uuid-resource",
  name: "Service Name",
  duration: 60,
  ...overrides,
});
