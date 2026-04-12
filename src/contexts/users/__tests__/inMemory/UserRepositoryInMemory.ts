import type { AuthUserRepository } from "@contexts/auth/application/ports/output/AuthUserRepository";
import type { AuthUser } from "@contexts/auth/domain/entities/AuthUser";
import { AuthUserMapper } from "@contexts/auth/infra/database/mapper/AuthUserMapper";
import type { UserRepository } from "@contexts/users/application/ports/output/UserRespository";
import type { User } from "@contexts/users/domain/entity/User";
import type { UserRow } from "@contexts/users/infra/database/types/UserRow";
import { Result } from "@core/result/Result";

export class UserRepositoryInMemory implements UserRepository, AuthUserRepository {
  private users: User[] = [];

  async create(user: User): Promise<Result<null>> {
    this.users.push(user);
    return Promise.resolve(Result.ok(null));
  }
  async findByEmail(email: string): Promise<Result<User | null>> {
    const user = this.users.find((user) => user.email.getValue() === email);
    if (!user) {
      return Promise.resolve(Result.ok(null));
    }
    return Promise.resolve(Result.ok(user));
  }
  findByEmailForAuth(email: string): Promise<Result<AuthUser | null>> {
    const user = this.users.find((user) => user.email.getValue() === email);
    if (!user) {
      return Promise.resolve(Result.ok(null));
    }
    const authUserRow: UserRow = {
      id: user.id,
      name: user.name,
      email: user.email.getValue(),
      password: user.password.getValue(),
      phone: user.phone,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      role: user.role,
    };
    return Promise.resolve(Result.ok(AuthUserMapper.toDomain(authUserRow)));
  }
}
