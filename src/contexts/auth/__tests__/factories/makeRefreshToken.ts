import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";

export const makeRefreshToken = (overrides?: {
  id?: string;
  userId?: string;
  expiresAt?: Date;
}) =>
  RefreshToken.create({
    id: overrides?.id ?? "uuid-123",
    userId: overrides?.userId ?? "uuid-123",
    expiresAt: overrides?.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24),
  });
