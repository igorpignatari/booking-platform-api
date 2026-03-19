import type { CreateUserRequest } from "@contexts/users/application/DTOs/createUserDTO";

export type CreateUserViewModel = Omit<CreateUserRequest, "password" | "email" | "phone"> & {
  id: string;
  createdAt: string;
};
