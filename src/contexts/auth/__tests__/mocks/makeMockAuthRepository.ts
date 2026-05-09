import type { AuthRepository } from "@contexts/auth/application/ports/output/AuthRepository";

export const makeMockAuthRepository = (): jest.Mocked<AuthRepository> => ({
  save: jest.fn(),
  findByJti: jest.fn(),
  revoke: jest.fn(),
  revokeAllByUserId: jest.fn(),
});
