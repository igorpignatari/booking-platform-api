import type { UserRepository } from "@contexts/users/application/ports/output/UserRepository";
import type { User } from "@contexts/users/domain/entity/User";
import { UserErrors } from "@contexts/users/domain/errors/UserErrors";
import type { Result } from "@core/result/Result";
import { tryCatchAsync } from "@core/tryCatch/tryCatch";
import type { ConflictError } from "@shared/errors/httpErrors";
import { DBError } from "@shared/infra/errors/DBError";
import type { IUserDAO } from "../daos/IUserDAO";
import { UserMapper } from "../mapper/UserMapper";

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly userDAO: IUserDAO) {}

  async create(user: User): Promise<Result<void, DBError | ConflictError>> {
    return tryCatchAsync(
      async () => {
        await this.userDAO.insert(UserMapper.toRow(user));
      },
      (err: unknown) => {
        if (err instanceof Error && "code" in err && err.code === "23505") {
          return UserErrors.USER_ALREADY_EXISTS.create(err.message);
        }
        return DBError.create(err instanceof Error ? err.message : "unknown error");
      },
    );
  }

  async findByEmail(email: string): Promise<Result<User | null, DBError>> {
    return tryCatchAsync(
      async () => {
        const user = await this.userDAO.findByEmail(email);
        return user ? UserMapper.toDomain(user) : null;
      },
      (err: unknown) => DBError.create(err instanceof Error ? err.message : "unknown error"),
    );
  }
}
