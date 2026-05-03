import { makeUser } from "@contexts/users/__tests__/factories/makeUser";
import { User } from "@contexts/users/domain/entity/User";
import { UserDAOPg } from "@contexts/users/infra/database/daos/pg/UserDAOPg";
import { UserRepositoryImpl } from "@contexts/users/infra/database/repositories/UserRepositoryImpl";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";
import { type TestDatabase, clearUsers, createTestDatabase } from "../helpers/createTestDatabase";

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let testDb: TestDatabase;
let repository: UserRepositoryImpl;

beforeAll(async () => {
  testDb = await createTestDatabase();

  const dao = new UserDAOPg(testDb.db);
  repository = new UserRepositoryImpl(dao);
});

afterAll(async () => {
  await testDb.teardown();
});

afterEach(async () => {
  await clearUsers(testDb.db);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hasher = new HashInMemory();

async function buildUser(overrides?: Partial<ReturnType<typeof makeUser>>) {
  const raw = makeUser(overrides);
  const result = await User.create(raw, hasher);
  if (result.isErr) throw new Error("Failed to build test user");
  return result.value;
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe("UserRepositoryImpl (integration)", () => {
  // ─── create ──────────────────────────────────────────────────────────────

  describe("create", () => {
    it("should persist a user in the database", async () => {
      // Arrange
      const user = await buildUser();

      // Act
      const result = await repository.create(user);

      // Assert
      expect(result.isOk).toBe(true);

      const row = await testDb.db.oneOrNone<{ id: string }>("SELECT id FROM users WHERE id = $1", [
        user.id,
      ]);
      expect(row).not.toBeNull();
      expect(row?.id).toBe(user.id);
    });

    it("should persist the correct field values", async () => {
      // Arrange
      const raw = makeUser({ name: "Maria Silva", phone: "11999990000" });
      const user = await buildUser(raw);

      // Act
      await repository.create(user);

      // Assert
      const row = await testDb.db.oneOrNone<{
        name: string;
        email: string;
        phone: string;
        role: string;
      }>("SELECT name, email, phone, role FROM users WHERE id = $1", [user.id]);

      expect(row?.name).toBe("Maria Silva");
      expect(row?.email).toBe(raw.email);
      expect(row?.phone).toBe("11999990000");
      expect(row?.role).toBe("user");
    });

    it("should return a ConflictError when email already exists", async () => {
      const user1 = await buildUser();
      await repository.create(user1);

      const user2 = await buildUser();

      // Act
      const result = await repository.create(user2);

      // Assert
      expect(result.isErr).toBe(true);
      expect(result.error.code).toBe("USER_ALREADY_EXISTS");
    });
  });

  // ─── findByEmail ─────────────────────────────────────────────────────────

  describe("findByEmail", () => {
    it("should return null when no user with that email exists", async () => {
      // Act
      const result = await repository.findByEmail("nonexistent@example.com");

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value).toBeNull();
    });

    it("should return the user when email exists", async () => {
      // Arrange
      const raw = makeUser({ email: "found@example.com" });
      const user = await buildUser(raw);
      await repository.create(user);

      // Act
      const result = await repository.findByEmail("found@example.com");

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value).not.toBeNull();
      expect(result.value?.id).toBe(user.id);
      expect(result.value?.name).toBe(user.name);
    });

    it("should return a proper domain User instance (not a plain row)", async () => {
      // Arrange
      const user = await buildUser();
      await repository.create(user);

      // Act
      const result = await repository.findByEmail(user.email.getValue());

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value).toBeInstanceOf(User);
      expect(typeof result.value?.email.getValue).toBe("function");
      expect(typeof result.value?.password.getValue).toBe("function");
    });

    it("should be case-sensitive for email lookup", async () => {
      // Arrange
      const user = await buildUser({ email: "casesensitive@example.com" });
      await repository.create(user);

      // Act
      const result = await repository.findByEmail("CaseSensitive@example.com");

      // Assert
      expect(result.isOk).toBe(true);
      expect(result.value).toBeNull();
    });
  });
});
