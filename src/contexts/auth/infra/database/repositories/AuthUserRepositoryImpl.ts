import type { AuthUserRepository } from "@contexts/auth/application/ports/output/AuthUserRepository";
import type { AuthUser } from "@contexts/auth/domain/entities/AuthUser";
import type { Result } from "@core/result/Result";
import { tryCatchAsync } from "@core/tryCatch/tryCatch";
import { DBError } from "@shared/infra/errors/DBError";
import type { AuthUserDAO } from "../DAOs/pg/AuthUserDAO";
import { AuthUserMapper } from "../mapper/AuthUserMapper";

export class AuthUserRepositoryImpl implements AuthUserRepository {
  constructor(private readonly authUserDAO: AuthUserDAO) {}

  findByEmailForAuth(email: string): Promise<Result<AuthUser | null>> {
    return tryCatchAsync(
      async () => {
        const user = await this.authUserDAO.findByEmail(email);
        return user ? AuthUserMapper.toDomain(user) : null;
      },
      (err: unknown) => DBError.create(err instanceof Error ? err.message : "unknown error"),
    );
  }

  findByUserIdForAuth(userId: string): Promise<Result<AuthUser | null>> {
    return tryCatchAsync(
      async () => {
        const user = await this.authUserDAO.findByUserId(userId);
        return user ? AuthUserMapper.toDomain(user) : null;
      },
      (err: unknown) => DBError.create(err instanceof Error ? err.message : "unknown error"),
    );
  }
}
