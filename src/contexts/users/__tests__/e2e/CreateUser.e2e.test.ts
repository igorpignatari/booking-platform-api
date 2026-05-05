import { makeUser } from "@contexts/users/__tests__/factories/makeUser";
import { type TestApp, clearUsers, createTestApp } from "./helpers/createTestApp";

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let app: TestApp;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.teardown();
});

afterEach(async () => {
  await clearUsers(app.db);
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function postUser(body: unknown) {
  return app.http.inject({
    method: "POST",
    url: "/users",
    headers: { "content-type": "application/json" },
    payload: body,
  });
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe("POST /users (e2e)", () => {
  // ─── 201 Created ─────────────────────────────────────────────────────────

  describe("201 Created", () => {
    it("should return 201 and the created user on valid input", async () => {
      // Arrange
      const input = makeUser();

      // Act
      const res = await postUser({
        name: input.name,
        email: input.email,
        password: input.password,
        phone: input.phone,
      });

      // Assert — HTTP
      console.log(res);
      expect(res.statusCode).toBe(201);

      // Assert — body (CreateUserViewModel)
      const body = res.json();
      expect(body.id).toBeDefined();
      expect(body.name).toBe(input.name);
      expect(body.createdAt).toBeDefined();
      expect(new Date(body.createdAt).toString()).not.toBe("Invalid Date");

      // Campos sensíveis nunca devem aparecer na resposta
      expect(body.password).toBeUndefined();
      expect(body.email).toBeUndefined();
      expect(body.phone).toBeUndefined();
    });

    it("should persist the user in the database after creation", async () => {
      // Arrange
      const input = makeUser();

      // Act
      const res = await postUser({
        name: input.name,
        email: input.email,
        password: input.password,
        phone: input.phone,
      });

      // Assert — registo existe na BD
      const row = await app.db.oneOrNone<{ id: string }>("SELECT id FROM users WHERE email = $1", [
        input.email,
      ]);
      expect(row).not.toBeNull();
      expect(row?.id).toBe(res.json().id);
    });
  });

  // ─── 409 Conflict ────────────────────────────────────────────────────────

  describe("409 Conflict", () => {
    it("should return 409 when email is already registered", async () => {
      // Arrange — primeiro registo com sucesso
      const input = makeUser();
      const payload = {
        name: input.name,
        email: input.email,
        password: input.password,
        phone: input.phone,
      };
      await postUser(payload);

      // Act — segunda tentativa com o mesmo email
      const res = await postUser(payload);

      // Assert
      expect(res.statusCode).toBe(409);

      // Confirma que só há um registo na BD
      const count = await app.db.oneOrNone<{ count: string }>(
        "SELECT COUNT(*) as count FROM users",
      );
      expect(Number(count?.count)).toBe(1);
    });
  });

  // ─── 422 Validation ──────────────────────────────────────────────────────

  describe("422 Unprocessable Entity", () => {
    it("should return 422 when name is missing", async () => {
      const input = makeUser();
      const res = await postUser({
        email: input.email,
        password: input.password,
        phone: input.phone,
      });
      expect(res.statusCode).toBe(422);
    });

    it("should return 422 when email is invalid", async () => {
      const input = makeUser();
      const res = await postUser({
        name: input.name,
        email: "not-an-email",
        password: input.password,
        phone: input.phone,
      });
      expect(res.statusCode).toBe(422);
    });

    it("should return 422 when password is too weak", async () => {
      const input = makeUser();
      const res = await postUser({
        name: input.name,
        email: input.email,
        password: "weak",
        phone: input.phone,
      });
      expect(res.statusCode).toBe(422);
    });

    it("should return 422 when phone has wrong length", async () => {
      const input = makeUser();
      const res = await postUser({
        name: input.name,
        email: input.email,
        password: input.password,
        phone: "123",
      });
      expect(res.statusCode).toBe(422);
    });

    it("should return 422 when body is empty", async () => {
      const res = await postUser({});
      expect(res.statusCode).toBe(422);
    });

    it("should return validation error details in the body", async () => {
      const res = await postUser({});
      const body = res.json();

      // O ValidationMiddleware devolve os erros — confirma que há conteúdo útil
      expect(body).toBeDefined();
      expect(typeof body).toBe("object");
    });
  });
});
