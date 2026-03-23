import type { AuthRepository } from "@contexts/auth/application/ports/output/AuthRepository";
import type { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";

export class AuthRepositoryInMemory implements AuthRepository {
  private refreshTokens: any[] = [];

  save(refreshToken: string): Promise<void> {
    this.refreshTokens.push(refreshToken);
    return Promise.resolve();
  }
  findByRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = this.refreshTokens.find((refreshToken) => refreshToken === token);
    return Promise.resolve(refreshToken);
  }
  delete(token: string): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter((refreshToken) => refreshToken !== token);
    return Promise.resolve();
  }
  deleteAllByUserId(userId: string): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter(
      (refreshToken) => refreshToken.userId !== userId,
    );
    return Promise.resolve();
  }
}
