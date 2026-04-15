import type { ResourceRepository } from "@contexts/business/application/ports/output/ResourceRepository";

export const makeMockResourceRepository = (): jest.Mocked<ResourceRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
});
