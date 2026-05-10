import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import type { AuthRow } from "../types/AuthRow";

export class AuthMapper {
  static toRow(refreshToken: RefreshToken): AuthRow {
    return {
      jti: refreshToken.id,
      user_id: refreshToken.userId,
      created_at: refreshToken.createdAt.toISOString(),
      expires_at: refreshToken.expiresAt.toISOString(),
      revoked_at: refreshToken.revokedAt ? refreshToken.revokedAt.toISOString() : null,
    };
  }

  static toDomain(row: AuthRow): RefreshToken {
    return RefreshToken.createFromPersisted({
      id: row.jti,
      userId: row.user_id,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
    });
  }
}
