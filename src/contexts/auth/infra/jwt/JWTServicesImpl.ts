import type { JWTServices } from "@contexts/auth/domain/contracts/JWTServices";
import { env } from "@shared/env/env";
import jwt from "jsonwebtoken";
import { type RefreshTokenPayload, refreshTokenPayloadSchema } from "./types/RefreshTokenPayload";
import { type TokenPayload, tokenPayloadSchema } from "./types/TokenPayload";

export class JWTServicesImpl implements JWTServices {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, env.jwtRefreshSecret, {
      expiresIn: env.jwtRefreshExpiresIn,
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    return tokenPayloadSchema.parse(decoded);
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
    return refreshTokenPayloadSchema.parse(decoded);
  }
}
