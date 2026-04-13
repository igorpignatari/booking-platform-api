import type { AuthRepository } from "@contexts/auth/application/ports/output/AuthRepository";
import type { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import { Result } from "@core/result/Result";

export class AuthRepositoryInMemory implements AuthRepository {
  private refreshTokens: RefreshToken[] = [];

  save(refreshToken: RefreshToken): Promise<Result<void>> {
    this.refreshTokens.push(refreshToken);
    return Promise.resolve(Result.ok(undefined));
  }
  findByRefreshToken(token: string): Promise<Result<RefreshToken | null>> {
    const refreshToken = this.refreshTokens.find((refreshToken) => {
      return refreshToken.token === token;
    });
    return Promise.resolve(refreshToken ? Result.ok(refreshToken) : Result.ok(null));
  }
  delete(token: string): Promise<Result<void>> {
    this.refreshTokens = this.refreshTokens.filter((refreshToken) => refreshToken.token !== token);
    return Promise.resolve(Result.ok(undefined));
  }
  deleteAllByUserId(userId: string): Promise<Result<void>> {
    this.refreshTokens = this.refreshTokens.filter(
      (refreshToken) => refreshToken.userId !== userId,
    );
    return Promise.resolve(Result.ok(undefined));
  }
}
