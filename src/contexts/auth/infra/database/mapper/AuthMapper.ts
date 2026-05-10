import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import type { AuthRow } from "../types/AuthRow";

export class AuthMapper {
  static toRow(refreshToken: RefreshToken): AuthRow {
    return {
      jti: refreshToken.id,
      userId: refreshToken.userId,
      createdAt: refreshToken.createdAt.toISOString(),
      expiresAt: refreshToken.expiresAt.toISOString(),
      revokedAt: refreshToken.revokedAt ? refreshToken.revokedAt.toISOString() : null,
    };
  }

  static toDomain(row: AuthRow): RefreshToken {
    return RefreshToken.createFromPersisted({
      id: row.jti,
      userId: row.userId,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
    });
  }
}
