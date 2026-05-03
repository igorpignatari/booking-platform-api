import { makeUser } from "@contexts/users/__tests__/factories/makeUser";
import { CreateUserUseCase } from "@contexts/users/application/useCases/CreateUserUseCase";
import { UserDAOPg } from "@contexts/users/infra/database/daos/pg/UserDAOPg";
import { UserRepositoryImpl } from "@contexts/users/infra/database/repositories/UserRepositoryImpl";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";
import { type TestDatabase, clearUsers, createTestDatabase } from "../helpers/createTestDatabase";

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let testDb: TestDatabase;
let useCase: CreateUserUseCase;

beforeAll(async () => {
  testDb = await createTestDatabase();

  const dao = new UserDAOPg(testDb.db);
  const repository = new UserRepositoryImpl(dao);
  const hasher = new HashInMemory();

  useCase = new CreateUserUseCase(repository, hasher);
});

afterAll(async () => {
  await testDb.teardown();
});

afterEach(async () => {
  await clearUsers(testDb.db);
});

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe("CreateUserUseCase (integration)", () => {
  // ─── happy path ──────────────────────────────────────────────────────────

  describe("success", () => {
    it("should create a user and persist it in the database", async () => {
      // Arrange
      const input = makeUser();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value.id).toBeDefined();
      expect(result.value.name).toBe(input.name);
      expect(result.value.email.getValue()).toBe(input.email);

      // Assert
      const row = await testDb.db.oneOrNone<{ id: string }>(
        "SELECT id FROM users WHERE email = $1",
        [input.email],
      );
      expect(row).not.toBeNull();
      expect(row?.id).toBe(result.value.id);
    });

    it("should hash the password before persisting", async () => {
      // Arrange
      const input = makeUser();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.value.password.getValue()).not.toBe(input.password);

      // Assert
      const row = await testDb.db.oneOrNone<{ password: string }>(
        "SELECT password FROM users WHERE id = $1",
        [result.value.id],
      );
      expect(row?.password).not.toBe(input.password);
    });

    it("should assign the default role 'user' to the created user", async () => {
      // Arrange & Act
      const result = await useCase.execute(makeUser());

      // Assert
      expect(result.value.role.getValue()).toBe("user");

      const row = await testDb.db.oneOrNone<{ role: string }>(
        "SELECT role FROM users WHERE id = $1",
        [result.value.id],
      );
      expect(row?.role).toBe("user");
    });

    it("should create multiple distinct users", async () => {
      // Arrange
      const input1 = makeUser({ email: "alice@example.com" });
      const input2 = makeUser({ email: "bob@example.com" });

      // Act
      const result1 = await useCase.execute(input1);
      const result2 = await useCase.execute(input2);

      // Assert
      expect(result1.isOk).toBe(true);
      expect(result2.isOk).toBe(true);
      expect(result1.value.id).not.toBe(result2.value.id);

      const count = await testDb.db.oneOrNone<{ count: string }>(
        "SELECT COUNT(*) as count FROM users",
      );
      expect(Number(count?.count)).toBe(2);
    });
  });

  // ─── failure paths ───────────────────────────────────────────────────────

  describe("failure", () => {
    it("should return USER_ALREADY_EXISTS when email is already taken", async () => {
      // Arrange
      const input = makeUser();
      await useCase.execute(input);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.error.code).toBe("USER_ALREADY_EXISTS");

      const count = await testDb.db.oneOrNone<{ count: string }>(
        "SELECT COUNT(*) as count FROM users",
      );
      expect(Number(count?.count)).toBe(1);
    });

    it("should not persist anything when the email domain is invalid", async () => {
      // Arrange
      const input = makeUser({ email: "not-an-email" });

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isErr).toBe(true);

      const count = await testDb.db.oneOrNone<{ count: string }>(
        "SELECT COUNT(*) as count FROM users",
      );
      expect(Number(count?.count)).toBe(0);
    });

    it("should not persist anything when the password is too weak", async () => {
      // Arrange
      const input = makeUser({ password: "weak" });

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isErr).toBe(true);

      const count = await testDb.db.oneOrNone<{ count: string }>(
        "SELECT COUNT(*) as count FROM users",
      );
      expect(Number(count?.count)).toBe(0);
    });
  });
});
