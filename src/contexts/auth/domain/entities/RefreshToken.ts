import type { TRefreshToken } from "../types/TRefreshToken";

export class RefreshToken {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly token: string,
    public readonly createdAt: Date,
    public readonly expiresAt: Date,
  ) {}

  static create(data: TRefreshToken): RefreshToken {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

    return new RefreshToken(crypto.randomUUID(), data.userId, data.token, expiresAt, new Date());
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }
}
