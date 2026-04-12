import { User } from "@contexts/users/domain/entity/User";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";

describe("User entity test", () => {
  it("should create a valid user", async () => {
    const hasher = new HashInMemory();

    const user = await User.create(
      {
        name: "joe doe",
        email: "joe_doe@example.com",
        password: "@Password123",
        phone: "+1234567890",
      },
      hasher,
    );

    expect(user.isOk).toBe(true);
    expect(user.value).toBeInstanceOf(User);
    expect(user.value.id).toBeDefined();
    expect(user.value.name).toBe("joe doe");
    expect(user.value.email.getValue()).toBe("joe_doe@example.com");
    expect(user.value.password.getValue()).toBe("hashed-@Password123");
    expect(user.value.phone).toBe("+1234567890");
    expect(user.value.role).toBe("user");
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
});
