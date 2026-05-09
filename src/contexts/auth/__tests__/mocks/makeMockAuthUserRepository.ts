import type { AuthUserRepository } from "@contexts/auth/application/ports/output/AuthUserRepository";

export const makeMockAuthUserRepository = (): jest.Mocked<AuthUserRepository> => ({
  findByEmailForAuth: jest.fn(),
  findByUserIdForAuth: jest.fn(),
});
