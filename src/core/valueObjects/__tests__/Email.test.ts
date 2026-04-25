import { Email } from "@core/valueObjects/Email";

describe("Email value object", () => {
  describe("sucess", () => {
    it("should create a valid email", () => {
      expect(Email.create("joe_doe@example.com").isOk).toBe(true);
      expect(Email.create("joe_doe@example.com").value.getValue()).toBe("joe_doe@example.com");
    });

    it("should  create from string", () => {
      expect(Email.createFromPersisted("joe_doe@example.com").getValue()).toBe(
        "joe_doe@example.com",
      );
    });
  });

  describe("failure", () => {
    it("should not create an invalid email", () => {
      expect(Email.create("joe.doe@.com").isErr).toBe(true);
    });
  });
});
