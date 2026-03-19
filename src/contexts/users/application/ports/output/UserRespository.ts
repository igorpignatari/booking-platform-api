import type { User } from "@contexts/users/domain/entity/User";
import type { Result } from "@core/result/Result";
import type { CreateUserRequest } from "../../DTOs/createUserDTO";

export interface UserRepository {
  create(user: CreateUserRequest): Promise<Result<null>>;
  findByEmail(email: string): Promise<Result<User | null>>;
}
