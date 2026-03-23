import type { TRefreshToken } from "@contexts/auth/domain/types/TRefreshToken";

export type RefreshTokenDTO = Omit<TRefreshToken, "expiresInDays" | "userId">;
