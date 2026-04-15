import type { BusinessRepository } from "@contexts/business/application/ports/output/BusinessRepository";

export const makeMockBusinessRepository = (): jest.Mocked<BusinessRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
});
