import { LoginUseCase } from "@contexts/auth/application/useCases/LoginUseCase";
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
let useCase: LoginUseCase;
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

  useCase = new LoginUseCase(authRepository, authUserRepository, jwtService, hasher);
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

describe("LoginUseCase (integration)", () => {
  describe("success", () => {
    it("should return accessToken and refreshToken on valid credentials", async () => {
      // Act
      const result = await useCase.execute({ email: userEmail, password: RAW_PASSWORD });

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value.accessToken).toBeDefined();
      expect(result.value.refreshToken).toBeDefined();
    });

    it("should persist a refresh token in the database after login", async () => {
      // Act
      await useCase.execute({ email: userEmail, password: RAW_PASSWORD });

      // Assert
      const row = await testDb.db.oneOrNone<{ user_id: string }>(
        "SELECT user_id FROM auth WHERE user_id = $1",
        [userId],
      );
      expect(row).not.toBeNull();
      expect(row?.user_id).toBe(userId);
    });
  });

  describe("failure", () => {
    it("should return USER_LOGIN_ERROR when email does not exist", async () => {
      // Act
      const result = await useCase.execute({
        email: "ghost@example.com",
        password: RAW_PASSWORD,
      });

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.error.code).toBe("USER_LOGIN_ERROR");
    });

    it("should return USER_LOGIN_ERROR when password is wrong", async () => {
      // Act
      const result = await useCase.execute({ email: userEmail, password: "wrong_password" });

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.error.code).toBe("USER_LOGIN_ERROR");
    });

    it("should not persist any token on failed login", async () => {
      // Act
      await useCase.execute({ email: userEmail, password: "wrong_password" });

      // Assert
      const count = await testDb.db.oneOrNone<{ count: string }>(
        "SELECT COUNT(*) as count FROM auth",
      );
      expect(Number(count?.count)).toBe(0);
    });
  });
});
