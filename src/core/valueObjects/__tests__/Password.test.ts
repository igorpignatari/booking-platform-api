import { Password } from "@core/valueObjects/Password";
import { HashInMemory } from "@shared/__tests__/inMemory/HashInMemory";

describe("Password value object", () => {
  describe("sucess", () => {
    it("should create a valid password", async () => {
      const hasher = new HashInMemory();
      expect(await Password.create("@Password123", hasher).then((x) => x.isOk)).toBe(true);
      expect(await Password.create("@Password123", hasher).then((x) => x.value.getValue())).toBe(
        "hashed-@Password123",
      );
    });

    it("should  create from string", async () => {
      expect(Password.createFromPersisted("hashed-@Password123").getValue()).toBe(
        "hashed-@Password123",
      );
    });

    it("should compare password", async () => {
      const hasher = new HashInMemory();
      expect(
        await Password.compare("@Password123", "hashed-@Password123", hasher).then((x) => x),
      ).toBe(true);
    });
  });

  describe("failure", () => {
    it("should not create an invalid password", async () => {
      const hasher = new HashInMemory();
      expect(await Password.create("@Passwor", hasher).then((x) => x.isErr)).toBe(true);
    });
  });
});
