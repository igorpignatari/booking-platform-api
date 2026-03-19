import type { CreateUserRequest } from "@contexts/users/application/DTOs/createUserDTO";
import type { Role } from "../valueObjects/Role";

export type TPersistedUser = CreateUserRequest & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
};
