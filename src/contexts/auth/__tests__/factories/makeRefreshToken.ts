import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";

export const makeRefreshToken = (overrides?: {
  id?: string;
  userId?: string;
  expiresAt?: Date;
}) =>
  RefreshToken.create({
    id: overrides?.id ?? crypto.randomUUID(),
    userId: overrides?.userId ?? crypto.randomUUID(),
    expiresAt: overrides?.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24),
  });
