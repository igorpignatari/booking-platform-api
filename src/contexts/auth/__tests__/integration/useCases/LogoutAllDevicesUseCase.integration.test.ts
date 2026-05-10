import { LoginUseCase } from "@contexts/auth/application/useCases/LoginUseCase";
import { LogoutAllDevicesUseCase } from "@contexts/auth/application/useCases/LogoutAllDevicesUseCase";
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
let logoutAllDevicesUseCase: LogoutAllDevicesUseCase;
let userId: string;
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
  logoutAllDevicesUseCase = new LogoutAllDevicesUseCase(authRepository);
});

afterAll(async () => {
  await testDb.teardown();
});

beforeEach(async () => {
  await clearAll(testDb.db);

  const hasher = new HashInMemory();
  const hashed = await hasher.hash(RAW_PASSWORD);
  const user = await seedUser(testDb.db, { password: hashed });
  userId = user.id;
  userEmail = user.email;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LogoutAllDevicesUseCase (integration)", () => {
  describe("success", () => {
    it("should revoke all tokens for the user", async () => {
      // Arrange — simulate 3 logins (3 devices)
      await loginUseCase.execute({ email: userEmail, password: RAW_PASSWORD });
      await loginUseCase.execute({ email: userEmail, password: RAW_PASSWORD });
      await loginUseCase.execute({ email: userEmail, password: RAW_PASSWORD });

      // Act
      const result = await logoutAllDevicesUseCase.execute({ userId });

      // Assert
      expect(result.isOk).toBe(true);

      const rows = await testDb.db.manyOrNone<{ revoked_at: string | null }>(
        "SELECT revoked_at FROM auth WHERE user_id = $1",
        [userId],
      );
      expect(rows).toHaveLength(3);
      expect(rows.every((r) => r.revoked_at !== null)).toBe(true);
    });

    it("should return ok when user has no active tokens (noop)", async () => {
      // Act
      const result = await logoutAllDevicesUseCase.execute({ userId });

      // Assert
      expect(result.isOk).toBe(true);
    });

    it("should not affect tokens from other users", async () => {
      // Arrange
      const hasher = new HashInMemory();
      const hashed = await hasher.hash(RAW_PASSWORD);
      const otherUser = await seedUser(testDb.db, {
        email: "other@example.com",
        password: hashed,
      });

      await loginUseCase.execute({ email: userEmail, password: RAW_PASSWORD });
      await loginUseCase.execute({ email: otherUser.email, password: RAW_PASSWORD });

      // Act
      await logoutAllDevicesUseCase.execute({ userId });

      // Assert — other user's token still active
      const row = await testDb.db.oneOrNone<{ revoked_at: string | null }>(
        "SELECT revoked_at FROM auth WHERE user_id = $1",
        [otherUser.id],
      );
      expect(row?.revoked_at).toBeNull();
    });
  });
});
