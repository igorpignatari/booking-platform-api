import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";

export const makeRefreshToken = (overrides?: {
  userId?: string;
  token?: string;
  expiresAt?: Date;
}) =>
  RefreshToken.create({
    userId: overrides?.userId ?? "uuid-123",
    token: overrides?.token ?? "valid-refresh-token",
    expiresAt: overrides?.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24),
  });
