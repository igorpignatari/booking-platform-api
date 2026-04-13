import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";

describe("JWT service", () => {
  const payload = { id: "any_id" };
  const jwtService = new JWTServicesImpl();

  it("should generate a access token", () => {
    const token = jwtService.generateAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  it("should generate a refresh token", () => {
    const refreshToken = jwtService.generateRefreshToken(payload);
    expect(refreshToken).toBeDefined();
    expect(typeof refreshToken).toBe("string");
  });

  it("should verify a access token", () => {
    const token = jwtService.generateAccessToken(payload);
    const decoded = jwtService.verifyAccessToken(token) as any;
    expect(decoded.id).toBe(payload.id);
  });

  it("should verify a refresh token", () => {
    const token = jwtService.generateRefreshToken(payload);
    const decoded = jwtService.verifyRefreshToken(token) as any;
    expect(decoded.id).toBe(payload.id);
  });
});
