import type { TAuthUser } from "@contexts/auth/domain/types/TAuthUser";

export const makeAuthUser = (overrides?: Partial<TAuthUser>): TAuthUser => ({
  id: "uuid-123",
  email: "joe_doe@example.com",
  password: "hashed-@Password123",
  role: "user",
  ...overrides,
});
