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
    return new RefreshToken(
      crypto.randomUUID(),
      data.userId,
      data.token,
      new Date(),
      data.expiresAt,
    );
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }
}
