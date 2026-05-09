import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";

describe("RefreshToken entity", () => {
  describe("create", () => {
    it("should create a refresh token with the provided data", () => {
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

      const token = RefreshToken.create({
        id: "uuid-123",
        userId: "user-456",
        expiresAt,
      });

      expect(token.id).toBe("uuid-123");
      expect(token.userId).toBe("user-456");
      expect(token.expiresAt).toBe(expiresAt);
      expect(token.createdAt).toBeInstanceOf(Date);
      expect(token.revokedAt).toBeNull();
    });

    it("should set createdAt to approximately now", () => {
      const before = new Date();

      const token = RefreshToken.create({
        id: "uuid-123",
        userId: "uuid-123",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      const after = new Date();

      expect(token.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(token.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("isExpired", () => {
    it("should return false when token is not expired", () => {
      const token = RefreshToken.create({
        id: "uuid-123",
        userId: "uuid-123",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });

      expect(token.isExpired()).toBe(false);
    });

    it("should return true when token is expired", () => {
      const token = RefreshToken.create({
        id: "uuid-123",
        userId: "uuid-123",
        expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      });

      expect(token.isExpired()).toBe(true);
    });
  });

  describe("revoke", () => {
    it("should return a new token with revokedAt set", () => {
      const token = RefreshToken.create({
        id: "uuid-123",
        userId: "uuid-123",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      const revoked = token.revoke();

      expect(revoked.revokedAt).toBeInstanceOf(Date);
      expect(revoked.revokedAt?.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should not mutate the original token", () => {
      const token = RefreshToken.create({
        id: "uuid-123",
        userId: "uuid-123",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      token.revoke();

      expect(token.revokedAt).toBeNull();
    });

    it("should preserve id, userId, createdAt and expiresAt after revoke", () => {
      const token = RefreshToken.create({
        id: "uuid-123",
        userId: "uuid-123",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      const revoked = token.revoke();

      expect(revoked.id).toBe(token.id);
      expect(revoked.userId).toBe(token.userId);
      expect(revoked.createdAt).toBe(token.createdAt);
      expect(revoked.expiresAt).toBe(token.expiresAt);
    });
  });

  describe("isRevoked", () => {
    it("should return false when token has not been revoked", () => {
      const token = RefreshToken.create({
        id: "uuid-123",
        userId: "uuid-123",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      expect(token.isRevoked()).toBe(false);
    });

    it("should return true when token has been revoked", () => {
      const token = RefreshToken.create({
        id: "uuid-123",
        userId: "uuid-123",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });

      expect(token.revoke().isRevoked()).toBe(true);
    });
  });
});
