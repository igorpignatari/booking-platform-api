import type { ServiceRepository } from "@contexts/business/application/ports/output/ServiceRepository";

export const makeMockServiceRepository = (): jest.Mocked<ServiceRepository> => ({
  save: jest.fn(),
});
