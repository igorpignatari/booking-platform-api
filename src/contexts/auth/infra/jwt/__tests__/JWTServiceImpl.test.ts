import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import type { RefreshTokenPayload } from "../types/RefreshTokenPayload";
import type { TokenPayload } from "../types/TokenPayload";

describe("JWT service", () => {
  const tokenPayload = { sub: crypto.randomUUID(), role: "user" } satisfies TokenPayload;
  const refreshTokenPayload = {
    sub: crypto.randomUUID(),
    jti: crypto.randomUUID(),
  } satisfies RefreshTokenPayload;
  const jwtService = new JWTServicesImpl();

  it("should generate a access token", () => {
    const token = jwtService.generateAccessToken(tokenPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  it("should generate a refresh token", () => {
    const refreshToken = jwtService.generateRefreshToken(refreshTokenPayload);
    expect(refreshToken).toBeDefined();
    expect(typeof refreshToken).toBe("string");
  });

  it("should verify a access token", () => {
    const token = jwtService.generateAccessToken(tokenPayload);
    const decoded = jwtService.verifyAccessToken(token) as TokenPayload;
    expect(decoded.sub).toBe(tokenPayload.sub);
  });

  it("should verify a refresh token", () => {
    const token = jwtService.generateRefreshToken(refreshTokenPayload);
    const decoded = jwtService.verifyRefreshToken(token) as RefreshTokenPayload;
    expect(decoded.sub).toBe(refreshTokenPayload.sub);
  });
});
