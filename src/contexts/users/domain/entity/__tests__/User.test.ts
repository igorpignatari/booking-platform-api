import { makeUser } from "@contexts/users/__tests__/factories/makeUser";
import { User } from "@contexts/users/domain/entity/User";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";

describe("User entity test", () => {
  it("should create a valid user", async () => {
    const hasher = new HashInMemory();

    const user = await User.create(makeUser(), hasher);

    expect(user.isOk).toBe(true);
    expect(user.value).toBeInstanceOf(User);
    expect(user.value.id).toBeDefined();
    expect(user.value.name).toBe("joe doe");
    expect(user.value.email.getValue()).toBe("joe_doe@example.com");
    expect(user.value.password.getValue()).toBe("hashed-@Password123");
    expect(user.value.phone).toBe("+1234567890");
    expect(user.value.role).toBe("user");
  });

  it("should return error when email is invalid", async () => {
    const hasher = new HashInMemory();
    const result = await User.create(makeUser({ email: "invalid email" }), hasher);
    expect(result.isErr).toBe(true);
  });

  it("should return error when password is too weak", async () => {
    const hasher = new HashInMemory();
    const result = await User.create(makeUser({ password: "weak" }), hasher);
    expect(result.isErr).toBe(true);
  });

  it("should return error when both email and password are invalid", async () => {
    const hasher = new HashInMemory();
    const result = await User.create(
      makeUser({ email: "invalid email", password: "invalid password" }),
      hasher,
    );
    expect(result.isErr).toBe(true);
  });

  it("should have default role as 'user'", async () => {
    const hasher = new HashInMemory();
    const result = await User.create(makeUser(), hasher);
    expect(result.value.role).toBe("user");
  });

  it("should hash the password on create", async () => {
    const hasher = new HashInMemory();
    const result = await User.create(makeUser(), hasher);
    expect(result.value.password.getValue()).not.toBe("@Password123");
  });
});

it("should create from persistence", () => {
  const user = User.createFromPersisted({
    id: crypto.randomUUID(),
    name: "joe doe",
    email: "joe_doe@example.com",
    password: "hashed-@Password123",
    phone: "+1234567890",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  expect(user.id).toBeDefined();
  expect(user.name).toBe("joe doe");
  expect(user.email.getValue()).toBe("joe_doe@example.com");
  expect(user.password.getValue()).toBe("hashed-@Password123");
  expect(user.phone).toBe("+1234567890");
  expect(user.role).toBe("user");
});
