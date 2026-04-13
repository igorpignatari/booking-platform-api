import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";

export const makeRefreshToken = (overrides?: { userId?: string; expiresInDays?: number }) =>
  RefreshToken.create({
    userId: overrides?.userId ?? "uuid-123",
    token: "valid-refresh-token",
    expiresInDays: overrides?.expiresInDays ?? 7,
  });
