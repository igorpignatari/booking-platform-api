import type { AuthUserRepository } from "@contexts/auth/application/ports/output/AuthUserRepository";
import type { AuthUser } from "@contexts/auth/domain/entities/AuthUser";
import { AuthUserMapper } from "@contexts/auth/infra/database/mapper/AuthUserMapper";
import type { AuthUserRow } from "@contexts/auth/infra/database/types/AuthUserRow";
import { Result } from "@core/result/Result";

export class AuthUserRepositoryInMemory implements AuthUserRepository {
  users: AuthUserRow[] = [];

  async findByEmailForAuth(email: string): Promise<Result<AuthUser | null>> {
    const user = this.users.find((user) => user.email === email);
    if (!user) {
      return Result.ok(null);
    }
    return Result.ok(AuthUserMapper.toDomain(user));
  }

  async findByUserIdForAuth(userId: string): Promise<Result<AuthUser | null>> {
    const user = this.users.find((user) => user.id === userId);
    if (!user) {
      return Result.ok(null);
    }
    return Result.ok(AuthUserMapper.toDomain(user));
  }
}
