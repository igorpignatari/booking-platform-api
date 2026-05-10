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

beforeAll(async () => {
  testDb = await createTestDatabase();

  const authDAO = new AuthDAO(testDb.db);
  const authUserDAO = new AuthUserDAO(testDb.db);
  const authRepository = new AuthRepositoryImpl(authDAO);
  const authUserRepository = new AuthUserRepositoryImpl(authUserDAO);
  const jwtService = new JWTServicesImpl();
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
// Helper — login and extract jti from the refresh token
// ---------------------------------------------------------------------------

async function loginAndGetJti(): Promise<string> {
  const loginResult = await loginUseCase.execute({ email: userEmail, password: RAW_PASSWORD });
  if (loginResult.isErr) throw new Error("Login failed in test helper");

  const jwtService = new JWTServicesImpl();
  const payload = jwtService.verifyRefreshToken(loginResult.value.refreshToken);
  return payload.jti;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("RefreshTokenUseCase (integration)", () => {
  describe("success", () => {
    it("should return a new accessToken and refreshToken", async () => {
      // Arrange
      const jti = await loginAndGetJti();

      // Act
      const result = await refreshTokenUseCase.execute({ jti });

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value.accessToken).toBeDefined();
      expect(result.value.refreshToken).toBeDefined();
    });

    it("should revoke the old token and create a new one in the database", async () => {
      // Arrange
      const jti = await loginAndGetJti();

      // Act
      await refreshTokenUseCase.execute({ jti });

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
    it("should return error when jti does not exist", async () => {
      // Act
      const result = await refreshTokenUseCase.execute({ jti: crypto.randomUUID() });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when token is expired", async () => {
      // Arrange — save an already-expired token directly
      const jti = crypto.randomUUID();
      const userId = (await testDb.db.oneOrNone<{ id: string }>("SELECT id FROM users LIMIT 1"))
        ?.id;

      await testDb.db.none(
        "INSERT INTO auth (jti, user_id, created_at, expires_at) VALUES ($1, $2, NOW(), $3)",
        [jti, userId, new Date(Date.now() - 1000)],
      );

      // Act
      const result = await refreshTokenUseCase.execute({ jti });

      // Assert
      expect(result.isErr).toBe(true);
    });

    it("should return error when token is already revoked", async () => {
      // Arrange
      const jti = await loginAndGetJti();
      await refreshTokenUseCase.execute({ jti }); // first use revokes it

      // Act — try to use the already-revoked token
      const result = await refreshTokenUseCase.execute({ jti });

      // Assert
      expect(result.isErr).toBe(true);
    });
  });
});
