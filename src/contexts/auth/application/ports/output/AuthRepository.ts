import type { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import type { Result } from "@core/result/Result";

export interface AuthRepository {
  save(refreshToken: RefreshToken): Promise<Result<void>>;
  findByJti(token: string): Promise<Result<RefreshToken | null>>;
  revoke(token: string): Promise<Result<void>>;
  revokeAllByUserId(userId: string): Promise<Result<void>>;
}
