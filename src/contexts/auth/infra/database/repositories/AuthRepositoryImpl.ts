import type { AuthRepository } from "@contexts/auth/application/ports/output/AuthRepository";
import type { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import { AuthErrors } from "@contexts/auth/domain/errors/AuthErrors";
import { Result } from "@core/result/Result";
import { tryCatchAsync } from "@core/tryCatch/tryCatch";
import { DBError } from "@shared/infra/errors/DBError";
import type { AuthDAO } from "../DAOs/pg/AuthDAO";
import { AuthMapper } from "../mapper/AuthMapper";
import type { AuthRow } from "../types/AuthRow";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authDAO: AuthDAO) {}

  save(refreshToken: RefreshToken): Promise<Result<void>> {
    return tryCatchAsync(
      async () => {
        await this.authDAO.insert(AuthMapper.toRow(refreshToken));
      },
      (err: unknown) => {
        if (err instanceof Error && "code" in err && err.code === "23505") {
          return AuthErrors.REFRESH_TOKEN_ALREADY_EXISTS.create(err.message);
        }
        return DBError.create(err instanceof Error ? err.message : "unknown error");
      },
    );
  }

  findByJti(jti: string): Promise<Result<RefreshToken | null>> {
    return tryCatchAsync(
      async () => {
        const token = await this.authDAO.findByJti(jti);
        return token ? AuthMapper.toDomain(token) : null;
      },
      (err: unknown) => DBError.create(err instanceof Error ? err.message : "unknown error"),
    );
  }

  async revoke(jti: string): Promise<Result<void>> {
    try {
      const row = await this.authDAO.findByJti(jti);
      if (!row) return Result.err(AuthErrors.REFRESH_TOKEN_NOT_FOUND.create("token not found"));

      const revoked = AuthMapper.toDomain(row).revoke();
      await this.authDAO.update(AuthMapper.toRow(revoked));
      return Result.ok(undefined);
    } catch (err) {
      return Result.err(DBError.create(err instanceof Error ? err.message : "unknown error"));
    }
  }

  async revokeAllByUserId(userId: string): Promise<Result<void>> {
    try {
      const rows = await this.authDAO.findAllByUserId(userId);

      if (rows.length === 0) return Result.ok(undefined); // nada a fazer, não é erro

      const revokedRows = rows
        .map((row: AuthRow) => AuthMapper.toDomain(row).revoke())
        .map((token: RefreshToken) => AuthMapper.toRow(token));

      await this.authDAO.updateMany(revokedRows);
      return Result.ok(undefined);
    } catch (err) {
      return Result.err(DBError.create(err instanceof Error ? err.message : "unknown error"));
    }
  }
}
