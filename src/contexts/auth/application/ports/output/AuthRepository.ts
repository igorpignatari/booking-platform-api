import type { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import type { Result } from "@core/result/Result";

export interface AuthRepository {
  save(refreshToken: RefreshToken): Promise<Result<void>>;
  findByRefreshToken(token: string): Promise<Result<RefreshToken | null>>;
  delete(token: string): Promise<Result<void>>;
  deleteAllByUserId(userId: string): Promise<Result<void>>;
}
