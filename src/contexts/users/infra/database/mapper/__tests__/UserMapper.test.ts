import { makeUser } from "@contexts/users/__tests__/factories/makeUser";
import { makeUserRow } from "@contexts/users/__tests__/factories/makeUserRow";
import { User } from "@contexts/users/domain/entity/User";
import { Role } from "@contexts/users/domain/valueObjects/Role";
import { UserMapper } from "@contexts/users/infra/database/mapper/UserMapper";
import { Email } from "@core/valueObjects/Email";
import { Password } from "@core/valueObjects/Password";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hasher = new HashInMemory();

async function buildDomainUser(overrides?: Partial<ReturnType<typeof makeUser>>) {
  const raw = makeUser(overrides);
  const result = await User.create(raw, hasher);
  if (result.isErr) throw new Error("Failed to build test user");
  return result.value;
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe("UserMapper", () => {
  // ─── toRow ───────────────────────────────────────────────────────────────

  describe("toRow", () => {
    it("should map all fields from User domain to UserRow", async () => {
      // Arrange
      const user = await buildDomainUser();

      // Act
      const row = UserMapper.toRow(user);

      // Assert
      expect(row.id).toBe(user.id);
      expect(row.name).toBe(user.name);
      expect(row.email).toBe(user.email.getValue());
      expect(row.password).toBe(user.password.getValue());
      expect(row.phone).toBe(user.phone);
      expect(row.role).toBe(user.role.getValue());
      expect(row.created_at).toBe(user.createdAt.toISOString());
      expect(row.updated_at).toBe(user.updatedAt.toISOString());
    });

    it("should extract the raw string from the Email value object", async () => {
      // Arrange
      const user = await buildDomainUser({ email: "test@example.com" });

      // Act
      const row = UserMapper.toRow(user);

      // Assert — deve ser uma string primitiva, não um objecto Email
      expect(typeof row.email).toBe("string");
      expect(row.email).toBe("test@example.com");
    });

    it("should extract the hashed string from the Password value object", async () => {
      // Arrange
      const user = await buildDomainUser({ password: "@Password123" });

      // Act
      const row = UserMapper.toRow(user);

      // Assert — deve ser o hash, nunca a password em claro
      expect(typeof row.password).toBe("string");
      expect(row.password).toBe("hashed-@Password123");
      expect(row.password).not.toBe("@Password123");
    });

    it("should extract the raw string from the Role value object", async () => {
      // Arrange
      const user = await buildDomainUser();

      // Act
      const row = UserMapper.toRow(user);

      // Assert
      expect(typeof row.role).toBe("string");
      expect(row.role).toBe("user");
    });

    it("should format createdAt as an ISO string", async () => {
      // Arrange
      const user = await buildDomainUser();

      // Act
      const row = UserMapper.toRow(user);

      // Assert — deve ser um ISO 8601 válido
      expect(typeof row.created_at).toBe("string");
      expect(() => new Date(row.created_at)).not.toThrow();
      expect(new Date(row.created_at).toISOString()).toBe(row.created_at);
    });

    it("should format updatedAt as an ISO string", async () => {
      // Arrange
      const user = await buildDomainUser();

      // Act
      const row = UserMapper.toRow(user);

      // Assert
      expect(typeof row.updated_at).toBe("string");
      expect(() => new Date(row.updated_at)).not.toThrow();
      expect(new Date(row.updated_at).toISOString()).toBe(row.updated_at);
    });
  });

  // ─── toDomain ────────────────────────────────────────────────────────────

  describe("toDomain", () => {
    it("should map all fields from UserRow to User domain", () => {
      // Arrange
      const row = makeUserRow();

      // Act
      const user = UserMapper.toDomain(row);

      // Assert
      expect(user.id).toBe(row.id);
      expect(user.name).toBe(row.name);
      expect(user.email.getValue()).toBe(row.email);
      expect(user.password.getValue()).toBe(row.password);
      expect(user.phone).toBe(row.phone);
      expect(user.role.getValue()).toBe(row.role);
    });

    it("should return an instance of User", () => {
      // Arrange
      const row = makeUserRow();

      // Act
      const user = UserMapper.toDomain(row);

      // Assert
      expect(user).toBeInstanceOf(User);
    });

    it("should reconstruct email as an Email value object", () => {
      // Arrange
      const row = makeUserRow({ email: "mapped@example.com" });

      // Act
      const user = UserMapper.toDomain(row);

      // Assert
      expect(user.email).toBeInstanceOf(Email);
      expect(user.email.getValue()).toBe("mapped@example.com");
    });

    it("should reconstruct password as a Password value object", () => {
      // Arrange
      const row = makeUserRow({ password: "hashed-supersecret" });

      // Act
      const user = UserMapper.toDomain(row);

      // Assert
      expect(user.password).toBeInstanceOf(Password);
      expect(user.password.getValue()).toBe("hashed-supersecret");
    });

    it("should reconstruct role as a Role value object", () => {
      // Arrange
      const row = makeUserRow({ role: "admin" });

      // Act
      const user = UserMapper.toDomain(row);

      // Assert
      expect(user.role).toBeInstanceOf(Role);
      expect(user.role.getValue()).toBe("admin");
    });

    it("should parse created_at string into a Date instance", () => {
      // Arrange
      const row = makeUserRow({ created_at: "2024-01-01T00:00:00.000Z" });

      // Act
      const user = UserMapper.toDomain(row);

      // Assert
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.createdAt.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should parse updated_at string into a Date instance", () => {
      // Arrange
      const row = makeUserRow({ updated_at: "2024-06-15T12:00:00.000Z" });

      // Act
      const user = UserMapper.toDomain(row);

      // Assert
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.updatedAt.toISOString()).toBe("2024-06-15T12:00:00.000Z");
    });
  });

  // ─── round-trip ──────────────────────────────────────────────────────────

  describe("round-trip", () => {
    it("toRow → toDomain should preserve all values", async () => {
      // Arrange — começa com um User do domínio
      const original = await buildDomainUser();

      // Act — converte para row e de volta para domínio
      const row = UserMapper.toRow(original);
      const restored = UserMapper.toDomain(row);

      // Assert — os valores devem ser idênticos
      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.email.getValue()).toBe(original.email.getValue());
      expect(restored.password.getValue()).toBe(original.password.getValue());
      expect(restored.phone).toBe(original.phone);
      expect(restored.role.getValue()).toBe(original.role.getValue());
      expect(restored.createdAt.toISOString()).toBe(original.createdAt.toISOString());
      expect(restored.updatedAt.toISOString()).toBe(original.updatedAt.toISOString());
    });

    it("toDomain → toRow should preserve all values", () => {
      // Arrange — começa com uma UserRow (como viria da BD)
      const originalRow = makeUserRow();

      // Act — converte para domínio e de volta para row
      const user = UserMapper.toDomain(originalRow);
      const restoredRow = UserMapper.toRow(user);

      // Assert
      expect(restoredRow.id).toBe(originalRow.id);
      expect(restoredRow.name).toBe(originalRow.name);
      expect(restoredRow.email).toBe(originalRow.email);
      expect(restoredRow.password).toBe(originalRow.password);
      expect(restoredRow.phone).toBe(originalRow.phone);
      expect(restoredRow.role).toBe(originalRow.role);
      expect(restoredRow.created_at).toBe(originalRow.created_at);
      expect(restoredRow.updated_at).toBe(originalRow.updated_at);
    });
  });
});
