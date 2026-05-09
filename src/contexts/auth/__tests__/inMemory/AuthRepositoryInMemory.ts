import type { AuthRepository } from "@contexts/auth/application/ports/output/AuthRepository";
import type { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import { Result } from "@core/result/Result";

export class AuthRepositoryInMemory implements AuthRepository {
  private refreshTokens: RefreshToken[] = [];

  async save(refreshToken: RefreshToken): Promise<Result<void>> {
    this.refreshTokens.push(refreshToken);
    return Result.ok();
  }
  async findByJti(jti: string): Promise<Result<RefreshToken | null>> {
    const refreshToken = this.refreshTokens.find((refreshToken) => {
      return refreshToken.id === jti;
    });
    return refreshToken ? Result.ok(refreshToken) : Result.ok(null);
  }
  async revoke(jti: string): Promise<Result<void>> {
    this.refreshTokens = this.refreshTokens.map((token) =>
      token.id === jti ? token.revoke() : token,
    );

    return Result.ok();
  }
  async revokeAllByUserId(userId: string): Promise<Result<void>> {
    this.refreshTokens = this.refreshTokens.map((token) =>
      token.userId === userId ? token.revoke() : token,
    );

    return Result.ok();
  }
}
