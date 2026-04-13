import { AuthUser } from "@contexts/auth/domain/entities/AuthUser";

describe("AuthUser entity", () => {
  describe("create", () => {
    it("should create an auth user with correct data", () => {
      const user = AuthUser.create({
        id: "uuid-123",
        email: "joe@example.com",
        password: "hashed-password",
        role: "user",
      });

      expect(user.id).toBe("uuid-123");
      expect(user.email).toBe("joe@example.com");
      expect(user.password).toBe("hashed-password");
      expect(user.role).toBe("user");
    });

    it("should create an admin auth user", () => {
      const user = AuthUser.create({
        id: "uuid-456",
        email: "admin@example.com",
        password: "hashed-password",
        role: "admin",
      });

      expect(user.role).toBe("admin");
    });
  });
});
