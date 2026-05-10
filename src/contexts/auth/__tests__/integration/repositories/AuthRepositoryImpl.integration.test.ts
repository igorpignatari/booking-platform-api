import { makeRefreshToken } from "@contexts/auth/__tests__/factories/makeRefreshToken";
import { AuthDAO } from "@contexts/auth/infra/database/DAOs/pg/AuthDAO";
import { AuthRepositoryImpl } from "@contexts/auth/infra/database/repositories/AuthRepositoryImpl";
import {
  type TestDatabase,
  clearAll,
  createTestDatabase,
  seedUser,
} from "../helpers/createTestDatabase";

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let testDb: TestDatabase;
let repository: AuthRepositoryImpl;
let userId: string;

beforeAll(async () => {
  testDb = await createTestDatabase();
  const dao = new AuthDAO(testDb.db);
  repository = new AuthRepositoryImpl(dao);
});

afterAll(async () => {
  await testDb.teardown();
});

beforeEach(async () => {
  await clearAll(testDb.db);
  const user = await seedUser(testDb.db);
  userId = user.id;
});

// ---------------------------------------------------------------------------
// save
// ---------------------------------------------------------------------------

describe("AuthRepositoryImpl (integration)", () => {
  describe("save", () => {
    it("should persist a refresh token in the database", async () => {
      // Arrange
      const token = makeRefreshToken({ userId });

      // Act
      const result = await repository.save(token);

      // Assert
      expect(result.isOk).toBe(true);

      const row = await testDb.db.oneOrNone<{ jti: string }>(
        "SELECT jti FROM auth WHERE jti = $1",
        [token.id],
      );
      expect(row).not.toBeNull();
      expect(row?.jti).toBe(token.id);
    });

    it("should persist the correct field values", async () => {
      // Arrange
      const token = makeRefreshToken({ userId });

      // Act
      await repository.save(token);

      // Assert
      const row = await testDb.db.oneOrNone<{
        jti: string;
        user_id: string;
        revoked_at: string | null;
      }>("SELECT jti, user_id, revoked_at FROM auth WHERE jti = $1", [token.id]);

      expect(row?.jti).toBe(token.id);
      expect(row?.user_id).toBe(userId);
      expect(row?.revoked_at).toBeNull();
    });

    it("should return REFRESH_TOKEN_ALREADY_EXISTS when jti is duplicated", async () => {
      // Arrange
      const token = makeRefreshToken({ userId });
      await repository.save(token);

      // Act
      const result = await repository.save(token);

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.error.code).toBe("REFRESH_TOKEN_ALREADY_EXISTS");
    });
  });

  // ---------------------------------------------------------------------------
  // findByJti
  // ---------------------------------------------------------------------------

  describe("findByJti", () => {
    it("should return null when token does not exist", async () => {
      // Act
      const result = await repository.findByJti(crypto.randomUUID());

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value).toBeNull();
    });

    it("should return the token when jti exists", async () => {
      // Arrange
      const token = makeRefreshToken({ userId });
      await repository.save(token);

      // Act
      const result = await repository.findByJti(token.id);

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value).not.toBeNull();
      expect(result.value?.id).toBe(token.id);
      expect(result.value?.userId).toBe(userId);
    });

    it("should return a revoked token", async () => {
      // Arrange
      const token = makeRefreshToken({ userId });
      await repository.save(token);
      await repository.revoke(token.id);

      // Act
      const result = await repository.findByJti(token.id);

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value?.isRevoked()).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // revoke
  // ---------------------------------------------------------------------------

  describe("revoke", () => {
    it("should set revoked_at on the token", async () => {
      // Arrange
      const token = makeRefreshToken({ userId });
      await repository.save(token);

      // Act
      const result = await repository.revoke(token.id);

      // Assert
      expect(result.isOk).toBe(true);

      const row = await testDb.db.oneOrNone<{ revoked_at: string | null }>(
        "SELECT revoked_at FROM auth WHERE jti = $1",
        [token.id],
      );
      expect(row?.revoked_at).not.toBeNull();
    });

    it("should return REFRESH_TOKEN_NOT_FOUND when jti does not exist", async () => {
      // Act
      const result = await repository.revoke(crypto.randomUUID());

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.error.code).toBe("REFRESH_TOKEN_NOT_FOUND");
    });

    it("should not affect other tokens", async () => {
      // Arrange
      const token1 = makeRefreshToken({ userId });
      const token2 = makeRefreshToken({ id: crypto.randomUUID(), userId });

      await repository.save(token1);
      await repository.save(token2);

      // Act
      await repository.revoke(token1.id);

      // Assert
      const result2 = await repository.findByJti(token2.id);
      expect(result2.value?.isRevoked()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // revokeAllByUserId
  // ---------------------------------------------------------------------------

  describe("revokeAllByUserId", () => {
    it("should revoke all tokens for a given user", async () => {
      // Arrange
      const token1 = makeRefreshToken({ userId });
      const token2 = makeRefreshToken({ id: crypto.randomUUID(), userId });

      await repository.save(token1);
      await repository.save(token2);

      // Act
      const result = await repository.revokeAllByUserId(userId);

      // Assert
      expect(result.isOk).toBe(true);

      const rows = await testDb.db.manyOrNone<{ revoked_at: string | null }>(
        "SELECT revoked_at FROM auth WHERE user_id = $1",
        [userId],
      );
      expect(rows.every((r) => r.revoked_at !== null)).toBe(true);
    });

    it("should return ok when user has no tokens (noop)", async () => {
      // Act
      const result = await repository.revokeAllByUserId(userId);

      // Assert
      expect(result.isOk).toBe(true);
    });

    it("should not affect tokens from other users", async () => {
      // Arrange
      const otherUser = await seedUser(testDb.db, { email: "other@example.com" });

      const token1 = makeRefreshToken({ userId });
      const token2 = makeRefreshToken({ id: crypto.randomUUID(), userId: otherUser.id });

      await repository.save(token1);
      await repository.save(token2);

      // Act
      await repository.revokeAllByUserId(userId);

      // Assert
      const row = await testDb.db.oneOrNone<{ revoked_at: string | null }>(
        "SELECT revoked_at FROM auth WHERE jti = $1",
        [token2.id],
      );
      expect(row?.revoked_at).toBeNull();
    });
  });
});
