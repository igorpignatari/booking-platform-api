import type { User } from "@contexts/users/domain/entity/User";
import type { Result } from "@core/result/Result";
import type { CreateUserRequest } from "../../DTOs/createUserDTO";

export interface ICreateUser {
  execute(request: CreateUserRequest): Promise<Result<User>>;
}
