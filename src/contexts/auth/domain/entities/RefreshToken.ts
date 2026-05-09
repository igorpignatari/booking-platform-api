import type { TRefreshToken } from "../types/TRefreshToken";

export class RefreshToken {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly expiresAt: Date,
    public readonly revokedAt: Date | null = null,
  ) {}

  static create(data: TRefreshToken): RefreshToken {
    return new RefreshToken(data.id, data.userId, new Date(), data.expiresAt);
  }

  revoke(): RefreshToken {
    return new RefreshToken(this.id, this.userId, this.createdAt, this.expiresAt, new Date());
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isRevoked(): boolean {
    return this.revokedAt !== null;
  }
}
