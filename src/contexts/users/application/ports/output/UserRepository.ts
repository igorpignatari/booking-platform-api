import type { User } from "@contexts/users/domain/entity/User";
import type { Result } from "@core/result/Result";
import type { ConflictError } from "@shared/errors/httpErrors";
import type { DBError } from "@shared/infra/errors/DBError";

export interface UserRepository {
  create(user: User): Promise<Result<void, DBError | ConflictError>>;
  findByEmail(email: string): Promise<Result<User | null, DBError>>;
}
