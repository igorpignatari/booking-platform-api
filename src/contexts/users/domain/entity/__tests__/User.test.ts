import { makeUser } from "@contexts/users/__tests__/factories/makeUser";
import { User } from "@contexts/users/domain/entity/User";
import { Role } from "@contexts/users/domain/valueObjects/Role";
import { Email } from "@core/valueObjects/Email";
import { Password } from "@core/valueObjects/Password";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";
import { AggregatedValidationError } from "@shared/domain/errors/AggregatedValidationError";

describe("User entity", () => {
  let hasher: HashInMemory;

  beforeEach(() => {
    hasher = new HashInMemory();
  });

  describe("create (success)", () => {
    it("should create a valid user with all fields", async () => {
      const result = await User.create(makeUser(), hasher);

      expect(result.isOk).toBe(true);
      expect(result.value).toBeInstanceOf(User);
      expect(result.value.id).toBeDefined();
      expect(result.value.name).toBe("joe doe");
      expect(result.value.phone).toBe("11234567890");
    });

    it("should wrap email in Email value object", async () => {
      const result = await User.create(makeUser(), hasher);

      expect(result.value.email).toBeInstanceOf(Email);
      expect(result.value.email.getValue()).toBe("joe_doe@example.com");
    });

    it("should wrap password in Password value object and hash it", async () => {
      const result = await User.create(makeUser(), hasher);

      expect(result.value.password).toBeInstanceOf(Password);
      expect(result.value.password.getValue()).toBe("hashed-@Password123");
      expect(result.value.password.getValue()).not.toBe("@Password123");
    });

    it("should default role to 'user'", async () => {
      const result = await User.create(makeUser(), hasher);

      expect(result.value.role).toBeInstanceOf(Role);
      expect(result.value.role.getValue()).toBe("user");
    });

    it("should generate a UUID for id", async () => {
      const result = await User.create(makeUser(), hasher);

      expect(result.value.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it("should set createdAt and updatedAt to current date", async () => {
      const before = Date.now();
      const result = await User.create(makeUser(), hasher);
      const after = Date.now();

      expect(result.value.createdAt).toBeInstanceOf(Date);
      expect(result.value.updatedAt).toBeInstanceOf(Date);
      expect(result.value.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.value.createdAt.getTime()).toBeLessThanOrEqual(after);
    });

    it("should generate unique ids for different users", async () => {
      const a = await User.create(makeUser(), hasher);
      const b = await User.create(makeUser(), hasher);

      expect(a.value.id).not.toBe(b.value.id);
    });
  });

  describe("create (failure)", () => {
    it("should return AggregatedValidationError when email is invalid", async () => {
      const result = await User.create(makeUser({ email: "invalid email" }), hasher);

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(AggregatedValidationError);
    });

    it("should return AggregatedValidationError when password is too weak", async () => {
      const result = await User.create(makeUser({ password: "weak" }), hasher);

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(AggregatedValidationError);
    });

    it("should aggregate multiple errors when both email and password are invalid", async () => {
      const result = await User.create(
        makeUser({ email: "invalid email", password: "weak" }),
        hasher,
      );

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(AggregatedValidationError);
      // assuming AggregatedValidationError exposes .errors
      expect(result.error.errors.length).toBeGreaterThanOrEqual(2);
    });

    it("should not expose User instance when validation fails", async () => {
      const result = await User.create(makeUser({ email: "bad" }), hasher);

      expect(result.isErr).toBe(true);
      // accessing .value on err should throw or be unsafe — just verify isErr path
      expect(() => result.value).toThrow();
    });
  });

  describe("createFromPersisted", () => {
    const persistedData = {
      id: "11111111-1111-1111-1111-111111111111",
      name: "joe doe",
      email: "joe_doe@example.com",
      password: "hashed-@Password123",
      phone: "+1234567890",
      role: "user",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-06-01T00:00:00Z"),
    };

    it("should rehydrate a User from persisted data", () => {
      const user = User.createFromPersisted(persistedData);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(persistedData.id);
      expect(user.name).toBe(persistedData.name);
      expect(user.phone).toBe(persistedData.phone);
    });

    it("should preserve createdAt and updatedAt from persistence", () => {
      const user = User.createFromPersisted(persistedData);

      expect(user.createdAt).toEqual(persistedData.createdAt);
      expect(user.updatedAt).toEqual(persistedData.updatedAt);
    });

    it("should rehydrate value objects without re-validation", () => {
      // password "hashed-@Password123" would fail Password.create validation
      // (no uppercase enforcement on already-hashed values), but createFromPersisted
      // should accept it without throwing
      expect(() => User.createFromPersisted(persistedData)).not.toThrow();
    });

    it("should rehydrate role correctly", () => {
      const user = User.createFromPersisted({ ...persistedData, role: "admin" });

      expect(user.role.getValue()).toBe("admin");
    });
  });
});
