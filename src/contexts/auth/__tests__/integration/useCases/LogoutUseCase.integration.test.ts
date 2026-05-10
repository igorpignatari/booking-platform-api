import { LoginUseCase } from "@contexts/auth/application/useCases/LoginUseCase";
import { LogoutUseCase } from "@contexts/auth/application/useCases/LogoutUseCase";
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
let logoutUseCase: LogoutUseCase;
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
  logoutUseCase = new LogoutUseCase(authRepository);
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
// Helper
// ---------------------------------------------------------------------------

async function loginAndGetJti(): Promise<string> {
  const result = await loginUseCase.execute({ email: userEmail, password: RAW_PASSWORD });
  if (result.isErr) throw new Error("Login failed in test helper");

  const jwtService = new JWTServicesImpl();
  const payload = jwtService.verifyRefreshToken(result.value.refreshToken);
  return payload.jti;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LogoutUseCase (integration)", () => {
  describe("success", () => {
    it("should revoke the token in the database", async () => {
      // Arrange
      const jti = await loginAndGetJti();

      // Act
      const result = await logoutUseCase.execute({ jti });

      // Assert
      expect(result.isOk).toBe(true);

      const row = await testDb.db.oneOrNone<{ revoked_at: string | null }>(
        "SELECT revoked_at FROM auth WHERE jti = $1",
        [jti],
      );
      expect(row?.revoked_at).not.toBeNull();
    });
  });

  describe("failure", () => {
    it("should return REFRESH_TOKEN_NOT_FOUND when jti does not exist", async () => {
      // Act
      const result = await logoutUseCase.execute({ jti: crypto.randomUUID() });

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.error.code).toBe("REFRESH_TOKEN_NOT_FOUND");
    });
  });
});
