import { type TestApp, clearAll, createTestApp, seedUser } from "./helpers/createTestApp";

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
  await clearAll(app.db);
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function postLogin(body: unknown) {
  return app.http.inject({
    method: "POST",
    url: "/auth/login",
    headers: { "content-type": "application/json" },
    payload: body,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /auth/login (e2e)", () => {
  describe("200 OK", () => {
    it("should return 200 with accessToken in body and refreshToken in cookie", async () => {
      // Arrange
      await seedUser(app);

      // Act
      const res = await postLogin({ email: "test@example.com", password: "@Password123" });

      // Assert — status
      expect(res.statusCode).toBe(200);

      // Assert — accessToken in body
      const body = res.body;
      expect(typeof body).toBe("string");
      expect(body.length).toBeGreaterThan(0);

      // Assert — refreshToken in Set-Cookie
      const setCookie = res.headers["set-cookie"] as string | undefined;
      expect(setCookie).toBeDefined();
      expect(setCookie).toMatch(/refreshToken=/);
      expect(setCookie).toMatch(/HttpOnly/i);
    });

    it("should persist a refresh token in the database after login", async () => {
      // Arrange
      const user = await seedUser(app);

      // Act
      await postLogin({ email: user.email, password: "@Password123" });

      // Assert
      const row = await app.db.oneOrNone<{ user_id: string }>(
        "SELECT user_id FROM auth WHERE user_id = (SELECT id FROM users WHERE email = $1)",
        [user.email],
      );
      expect(row).not.toBeNull();
    });
  });

  describe("401 Unauthorized", () => {
    it("should return 401 when email does not exist", async () => {
      const res = await postLogin({ email: "ghost@example.com", password: "@Password123" });
      expect(res.statusCode).toBe(401);
    });

    it("should return 401 when password is wrong", async () => {
      // Arrange
      await seedUser(app);

      // Act
      const res = await postLogin({ email: "test@example.com", password: "WrongPass123!" });

      // Assert
      expect(res.statusCode).toBe(401);
    });

    it("should not persist any token on failed login", async () => {
      // Arrange
      await seedUser(app);

      // Act
      await postLogin({ email: "test@example.com", password: "wrong" });

      // Assert
      const count = await app.db.oneOrNone<{ count: string }>("SELECT COUNT(*) as count FROM auth");
      expect(Number(count?.count)).toBe(0);
    });
  });

  describe("422 Unprocessable Entity", () => {
    it("should return 422 when email is missing", async () => {
      const res = await postLogin({ password: "@Password123" });
      expect(res.statusCode).toBe(422);
    });

    it("should return 422 when password is missing", async () => {
      const res = await postLogin({ email: "test@example.com" });
      expect(res.statusCode).toBe(422);
    });

    it("should return 422 when email is invalid", async () => {
      const res = await postLogin({ email: "not-an-email", password: "@Password123" });
      expect(res.statusCode).toBe(422);
    });

    it("should return 422 when body is empty", async () => {
      const res = await postLogin({});
      expect(res.statusCode).toBe(422);
    });
  });
});
