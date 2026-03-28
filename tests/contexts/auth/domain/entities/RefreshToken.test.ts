import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import type { TRefreshToken } from "@contexts/auth/domain/types/TRefreshToken";
import { env } from "@shared/env/env";

describe("Refresh token entity", () => {
  it("should create a refresh token", () => {
    const refreshToken: TRefreshToken = {
      userId: "1",
      token: "any_token",
      expiresInDays: Number(env.jwtRefreshExpiresIn.split("")[0]),
    };
    const token = RefreshToken.create(refreshToken);
    expect(token.id).toBeDefined();
    expect(token.token).toBe("any_token");
    expect(token.userId).toBe("1");
  });
});
