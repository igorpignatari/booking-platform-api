import { z } from "zod";
import type { HttpRequest } from "../../http/HttpRequest";
import { ValidationMiddleware } from "../ValidationMiddleware";

const makeHttpRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  correlationId: "test-correlation-id",
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    fatal: jest.fn(),
    child: jest.fn(),
  } as never,
  ...overrides,
});

describe("ValidationMiddleware", () => {
  const schema = z.object({
    body: z.object({
      email: z.email("Invalid email"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }),
  });

  describe("when input is valid", () => {
    it("should return undefined to let the request proceed", async () => {
      const middleware = new ValidationMiddleware(schema);
      const request = makeHttpRequest({
        body: { email: "user@example.com", password: "password123" },
      });

      const result = await middleware.handle(request);

      expect(result).toBeUndefined();
    });

    it("should replace request.body with the parsed data", async () => {
      const schemaWithTransform = z.object({
        body: z.object({
          email: z.email().toLowerCase(),
          password: z.string().min(8),
        }),
      });

      const middleware = new ValidationMiddleware(schemaWithTransform);
      const request = makeHttpRequest({
        body: { email: "USER@EXAMPLE.COM", password: "password123" },
      });

      await middleware.handle(request);

      expect(request.body).toEqual({
        email: "user@example.com",
        password: "password123",
      });
    });
  });

  describe("when input is invalid", () => {
    it("should return 400 with parsed error messages", async () => {
      const middleware = new ValidationMiddleware(schema);
      const request = makeHttpRequest({
        body: { email: "not-an-email", password: "123" },
      });

      const result = await middleware.handle(request);

      expect(result).toBeDefined();
      expect(result?.statusCode).toBe(400);
      expect(result?.data).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Invalid email"),
          expect.stringContaining("Password must be at least 8 characters"),
        ]),
      );
    });

    it("should include the field path in each error message", async () => {
      const middleware = new ValidationMiddleware(schema);
      const request = makeHttpRequest({
        body: { email: "bad", password: "123" },
      });

      const result = await middleware.handle(request);

      expect(result?.data).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/\[body\.email\]/),
          expect.stringMatching(/\[body\.password\]/),
        ]),
      );
    });

    it("should not mutate request.body when validation fails", async () => {
      const middleware = new ValidationMiddleware(schema);
      const originalBody = { email: "bad", password: "123" };
      const request = makeHttpRequest({ body: { ...originalBody } });

      await middleware.handle(request);

      expect(request.body).toEqual(originalBody);
    });

    it("should return all validation errors at once, not just the first", async () => {
      const middleware = new ValidationMiddleware(schema);
      const request = makeHttpRequest({
        body: { email: "bad", password: "123" },
      });

      const result = await middleware.handle(request);

      expect(result?.data).toHaveLength(2);
    });
  });

  describe("when validating multiple sources", () => {
    it("should validate body, params and query together", async () => {
      const fullSchema = z.object({
        body: z.object({ name: z.string().min(1, "Name required") }),
        params: z.object({ id: z.uuid("Invalid id") }),
        query: z.object({ page: z.string().regex(/^\d+$/, "Page must be a number") }),
      });

      const middleware = new ValidationMiddleware(fullSchema);
      const request = makeHttpRequest({
        body: { name: "" },
        params: { id: "not-a-uuid" },
        query: { page: "abc" },
      });

      const result = await middleware.handle(request);

      expect(result?.statusCode).toBe(400);
      expect(result?.data).toHaveLength(3);
    });

    it("should pass when all sources are valid", async () => {
      const fullSchema = z.object({
        body: z.object({ name: z.string().min(1) }),
        params: z.object({ id: z.uuid() }),
        query: z.object({ page: z.string().regex(/^\d+$/) }),
      });

      const middleware = new ValidationMiddleware(fullSchema);
      const request = makeHttpRequest({
        body: { name: "John" },
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
        query: { page: "1" },
      });

      const result = await middleware.handle(request);

      expect(result).toBeUndefined();
    });
  });
});
