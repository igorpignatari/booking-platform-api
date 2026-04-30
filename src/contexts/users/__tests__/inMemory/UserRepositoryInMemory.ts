import type { UserRepository } from "@contexts/users/application/ports/output/UserRepository";
import type { User } from "@contexts/users/domain/entity/User";
import { Result } from "@core/result/Result";
import type { ConflictError } from "@shared/errors/httpErrors";
import type { DBError } from "@shared/infra/errors/DBError";

export class UserRepositoryInMemory implements UserRepository {
  private users: User[] = [];

  async create(user: User): Promise<Result<void, DBError | ConflictError>> {
    this.users.push(user);
    return Promise.resolve(Result.ok());
  }
  async findByEmail(email: string): Promise<Result<User | null, DBError>> {
    const user = this.users.find((user) => user.email.getValue() === email);
    if (!user) {
      return Promise.resolve(Result.ok(null));
    }
    return Promise.resolve(Result.ok(user));
  }
}
