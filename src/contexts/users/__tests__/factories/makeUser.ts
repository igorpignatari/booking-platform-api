import type { CreateUserRequest } from "@contexts/users/application/DTOs/createUserDTO";

export const makeUser = (overrides?: Partial<CreateUserRequest>): CreateUserRequest => ({
  name: "joe doe",
  email: "joe_doe@example.com",
  password: "@Password123",
  phone: "+1234567890",
  ...overrides,
});
