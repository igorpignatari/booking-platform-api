import type { User } from "@contexts/users/domain/entity/User";
import type { Result } from "@core/result/Result";

export interface UserRepository {
  create(user: User): Promise<Result<null>>;
  findByEmail(email: string): Promise<Result<User | null>>;
}
