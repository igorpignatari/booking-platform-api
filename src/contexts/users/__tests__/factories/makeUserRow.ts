import type { UserRow } from "@contexts/users/infra/database/types/UserRow";

export const makeUserRow = (overrides?: Partial<UserRow>): UserRow => ({
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "joe doe",
  email: "joe_doe@example.com",
  password: "hashed-@Password123",
  phone: "+1234567890",
  role: "user",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-15T10:30:00.000Z",
  ...overrides,
});
