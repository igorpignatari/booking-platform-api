import type { User } from "@contexts/users/domain/entity/User";
import type { CreateUserViewModel } from "./CreateUserViewModel";

export const createUserToHttp = (user: User): CreateUserViewModel => {
  return {
    id: user.id,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
};
