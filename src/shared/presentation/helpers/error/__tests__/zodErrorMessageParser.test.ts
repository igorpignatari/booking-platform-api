import { z } from "zod";
import { zodErrorMessageParser } from "../zodErrorMessageParser";

const fakeValidationSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

describe("zodErrorMessageParser", () => {
  it("should return an array of error messages", () => {
    const result = fakeValidationSchema.safeParse({
      email: "not-an-email",
      password: "123",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const messages = zodErrorMessageParser(result.error);

    expect(messages).toHaveLength(2);
    expect(messages).toContain("[email]: Invalid email");
    expect(messages).toContain("[password]: Password must be at least 8 characters");
    expect(messages).toEqual([
      "[email]: Invalid email",
      "[password]: Password must be at least 8 characters",
    ]);
  });

  it("should include path with dot notation for nested fields", () => {
    const nestedSchema = z.object({
      user: z.object({
        email: z.email("Invalid email"),
      }),
    });

    const result = nestedSchema.safeParse({ user: { email: "x" } });
    if (result.success) throw new Error("expected failure");

    const messages = zodErrorMessageParser(result.error);
    expect(messages[0]).toBe("[user.email]: Invalid email");
  });
});
