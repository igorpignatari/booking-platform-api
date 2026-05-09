import type { RefreshTokenPayload } from "@contexts/auth/infra/jwt/types/RefreshTokenPayload";
import type { TokenPayload } from "@contexts/auth/infra/jwt/types/TokenPayload";

export interface JWTServices {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: RefreshTokenPayload): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): RefreshTokenPayload;
}
