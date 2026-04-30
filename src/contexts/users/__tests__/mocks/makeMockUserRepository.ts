import type { UserRepository } from "@contexts/users/application/ports/output/UserRepository";

export const makeMockUserRepository = (): jest.Mocked<UserRepository> => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
});
