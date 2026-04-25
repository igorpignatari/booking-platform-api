import type { AuthRepository } from "@contexts/auth/application/ports/output/AuthRepository";

export const makeMockAuthRepository = (): jest.Mocked<AuthRepository> => ({
  save: jest.fn(),
  findByRefreshToken: jest.fn(),
  delete: jest.fn(),
  deleteAllByUserId: jest.fn(),
});
