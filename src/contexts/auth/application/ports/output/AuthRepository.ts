import type { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import type { Result } from "@core/result/Result";

export interface AuthRepository {
  save(refreshToken: RefreshToken): Promise<Result<void>>;
  findByJti(jti: string): Promise<Result<RefreshToken | null>>;
  revoke(jti: string): Promise<Result<void>>;
  revokeAllByUserId(userId: string): Promise<Result<void>>;
}
