import type { AuthRepository } from "@contexts/auth/application/ports/output/AuthRepository";
import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import { Result } from "@core/result/Result";
import { env } from "@shared/env/env";

export class AuthRepositoryInMemory implements AuthRepository {
  private refreshTokens: RefreshToken[] = [
    RefreshToken.create({
      userId: "1",
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA0MjdiMGI5LTQ4Y2QtNDVjNi04YjkzLWVjNzcwZDQyNzY4NCIsImlhdCI6MTc3NDY1MTQyNSwiZhwIjoxNzc1MjU2MjI1fQ.4xXM_h-dF_S1UefUcdWAefcIWbVY2DXlFdNPuoB7B8w",
      expiresInDays: Number(env.jwtRefreshExpiresIn),
    }),
  ];

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
