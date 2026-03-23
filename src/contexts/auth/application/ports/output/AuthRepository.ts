import type { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";

export interface AuthRepository {
  save(refreshToken: string): Promise<void>;
  findByRefreshToken(token: string): Promise<RefreshToken | null>;
  delete(token: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
}
