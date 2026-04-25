import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";

describe("RefreshToken entity", () => {
  describe("create", () => {
    it("should create a refresh token with correct data", () => {
      const token = RefreshToken.create({
        userId: "uuid-123",
        token: "any_token",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });

      expect(token.id).toBeDefined();
      expect(token.userId).toBe("uuid-123");
      expect(token.token).toBe("any_token");
      expect(token.createdAt).toBeInstanceOf(Date);
      expect(token.expiresAt).toBeInstanceOf(Date);
    });

    it("should set expiresAt to N days from now", () => {
      const before = new Date();
      const token = RefreshToken.create({
        userId: "uuid-123",
        token: "any_token",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      const after = new Date();

      const expectedMin = new Date(before);
      expectedMin.setDate(expectedMin.getDate() + 7);

      const expectedMax = new Date(after);
      expectedMax.setDate(expectedMax.getDate() + 7);

      expect(token.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(token.expiresAt.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
    });

    it("should generate unique ids", () => {
      const t1 = RefreshToken.create({
        userId: "uuid-123",
        token: "token-1",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
      const t2 = RefreshToken.create({
        userId: "uuid-123",
        token: "token-2",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      expect(t1.id).not.toBe(t2.id);
    });
  });

  describe("isExpired", () => {
    it("should return false when token is not expired", () => {
      const token = RefreshToken.create({
        userId: "uuid-123",
        token: "any_token",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });

      expect(token.isExpired()).toBe(false);
    });

    it("should return true when token is expired", () => {
      const token = RefreshToken.create({
        userId: "uuid-123",
        token: "any_token",
        expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      });

      expect(token.isExpired()).toBe(true);
    });
  });
});
