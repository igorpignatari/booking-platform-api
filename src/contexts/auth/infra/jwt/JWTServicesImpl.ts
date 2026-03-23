import type { JWTServices } from "@contexts/auth/domain/contracts/JWTServices";
import { env } from "@shared/env/env";
import jwt from "jsonwebtoken";

export class JWTServicesImpl implements JWTServices {
  generateAccessToken(payload: any): string {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  }
  generateRefreshToken(payload: any): string {
    return jwt.sign(payload, env.jwtRefreshSecret, {
      expiresIn: env.jwtRefreshExpiresIn,
    });
  }
  verifyAccessToken(token: string) {
    return jwt.verify(token, env.jwtSecret);
  }
  verifyRefreshToken(token: string) {
    return jwt.verify(token, env.jwtRefreshSecret);
  }
}
