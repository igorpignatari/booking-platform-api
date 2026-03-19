import type { CreateUserRequest } from "@contexts/users/application/DTOs/createUserDTO";
import type { UserRepository } from "@contexts/users/application/ports/output/UserRespository";
import type { User } from "@contexts/users/domain/entity/User";
import { Result } from "@core/result/Result";

export class UserRepositoryInMemory implements UserRepository {
  private users: any[] = [];

  async create(user: CreateUserRequest): Promise<Result<null>> {
    this.users.push(user);
    return Promise.resolve(Result.ok(null));
  }
  findByEmail(email: string): Promise<Result<User | null>> {
    const user = this.users.find((user) => user.email === email);
    return Promise.resolve(Result.ok(user || null));
  }
}
