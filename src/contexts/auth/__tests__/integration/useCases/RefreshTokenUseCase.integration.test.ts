import { LoginUseCase } from "@contexts/auth/application/useCases/LoginUseCase";
import { RefreshTokenUseCase } from "@contexts/auth/application/useCases/RefreshTokenUseCase";
import { AuthDAO } from "@contexts/auth/infra/database/DAOs/pg/AuthDAO";
import { AuthUserDAO } from "@contexts/auth/infra/database/DAOs/pg/AuthUserDAO";
import { AuthRepositoryImpl } from "@contexts/auth/infra/database/repositories/AuthRepositoryImpl";
import { AuthUserRepositoryImpl } from "@contexts/auth/infra/database/repositories/AuthUserRepositoryImpl";
import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";
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
let loginUseCase: LoginUseCase;
let refreshTokenUseCase: RefreshTokenUseCase;
let userEmail: string;
const RAW_PASSWORD = "plaintext_password";
const jwtService = new JWTServicesImpl();

beforeAll(async () => {
  testDb = await createTestDatabase();

  const authDAO = new AuthDAO(testDb.db);
  const authUserDAO = new AuthUserDAO(testDb.db);
  const authRepository = new AuthRepositoryImpl(authDAO);
  const authUserRepository = new AuthUserRepositoryImpl(authUserDAO);
  const hasher = new HashInMemory();

  loginUseCase = new LoginUseCase(authRepository, authUserRepository, jwtService, hasher);
  refreshTokenUseCase = new RefreshTokenUseCase(authUserRepository, authRepository, jwtService);
});

afterAll(async () => {
  await testDb.teardown();
});

beforeEach(async () => {
  await clearAll(testDb.db);

  const hasher = new HashInMemory();
  const hashed = await hasher.hash(RAW_PASSWORD);
  const user = await seedUser(testDb.db, { password: hashed });
  userEmail = user.email;
});

// ---------------------------------------------------------------------------
// Helper — login and return the refresh token JWT and its jti
// ---------------------------------------------------------------------------

async function loginAndGetTokens(): Promise<{ refreshToken: string; jti: string }> {
  const result = await loginUseCase.execute({ email: userEmail, password: RAW_PASSWORD });
  if (result.isErr) throw new Error("Login failed in test helper");

  const refreshToken = result.value.refreshToken;
  const { jti } = jwtService.verifyRefreshToken(refreshToken);
  return { refreshToken, jti };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("RefreshTokenUseCase (integration)", () => {
  describe("success", () => {
    it("should return a new accessToken and refreshToken", async () => {
      // Arrange
      const { refreshToken } = await loginAndGetTokens();

      // Act
      const result = await refreshTokenUseCase.execute({ refreshToken });

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value.accessToken).toBeDefined();
      expect(result.value.refreshToken).toBeDefined();
    });

    it("should revoke the old token and create a new one in the database", async () => {
      // Arrange
      const { refreshToken, jti } = await loginAndGetTokens();

      // Act
      await refreshTokenUseCase.execute({ refreshToken });

      // Assert — old token revoked
      const oldRow = await testDb.db.oneOrNone<{ revoked_at: string | null }>(
        "SELECT revoked_at FROM auth WHERE jti = $1",
        [jti],
      );
      expect(oldRow?.revoked_at).not.toBeNull();

      // Assert — new token created
      const count = await testDb.db.oneOrNone<{ count: string }>(
        "SELECT COUNT(*) as count FROM auth WHERE revoked_at IS NULL",
      );
      expect(Number(count?.count)).toBe(1);
    });
  });

  describe("failure", () => {
    it("should return error when JWT signature is invalid", async () => {
      // Act
      const result = await refreshTokenUseCase.execute({ refreshToken: "invalid.jwt.token" });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when token is expired in the database", async () => {
      // Arrange — login to get a valid JWT, then override the DB row to be expired
      const { refreshToken, jti } = await loginAndGetTokens();

      await testDb.db.none("UPDATE auth SET expires_at = $1 WHERE jti = $2", [
        new Date(Date.now() - 1000),
        jti,
      ]);

      // Act
      const result = await refreshTokenUseCase.execute({ refreshToken });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when token is already revoked", async () => {
      // Arrange
      const { refreshToken } = await loginAndGetTokens();
      await refreshTokenUseCase.execute({ refreshToken }); // first use revokes it

      // Act — try to use the already-revoked token
      const result = await refreshTokenUseCase.execute({ refreshToken });

      // Assert
      expect(result.isErr).toBe(true);
    });
  });
});
