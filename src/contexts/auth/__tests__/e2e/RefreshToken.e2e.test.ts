import { type TestApp, clearAll, createTestApp, login, seedUser } from "./helpers/createTestApp";

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

async function postRefreshToken(refreshTokenCookie?: string) {
  return app.http.inject({
    method: "POST",
    url: "/auth/refresh-token",
    headers: {
      "content-type": "application/json",
      ...(refreshTokenCookie && { cookie: `refreshToken=${refreshTokenCookie}` }),
    },
    payload: {},
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /auth/refresh-token (e2e)", () => {
  describe("200 OK", () => {
    it("should return 200 with new accessToken in body and new refreshToken in cookie", async () => {
      // Arrange
      await seedUser(app);
      const { refreshToken } = await login(app, {
        email: "test@example.com",
        password: "@Password123",
      });

      // Act
      const res = await postRefreshToken(refreshToken);

      // Assert
      expect(res.statusCode).toBe(200);

      const body = res.body;
      expect(typeof body).toBe("string");
      expect(body.length).toBeGreaterThan(0);

      const setCookie = res.headers["set-cookie"] as string | undefined;
      expect(setCookie).toBeDefined();
      expect(setCookie).toMatch(/refreshToken=/);
    });

    it("should revoke the old token and persist a new one", async () => {
      // Arrange
      await seedUser(app);
      const { refreshToken } = await login(app, {
        email: "test@example.com",
        password: "@Password123",
      });

      // Act
      await postRefreshToken(refreshToken);

      // Assert — exactly one active token in DB
      const count = await app.db.oneOrNone<{ count: string }>(
        "SELECT COUNT(*) as count FROM auth WHERE revoked_at IS NULL",
      );
      expect(Number(count?.count)).toBe(1);

      // Assert — old token revoked
      const revokedCount = await app.db.oneOrNone<{ count: string }>(
        "SELECT COUNT(*) as count FROM auth WHERE revoked_at IS NOT NULL",
      );
      expect(Number(revokedCount?.count)).toBe(1);
    });
  });

  describe("401 Unauthorized", () => {
    it("should return 401 when cookie is missing", async () => {
      const res = await postRefreshToken(undefined);
      expect(res.statusCode).toBe(401);
    });

    it("should return 401 when token is invalid", async () => {
      const res = await postRefreshToken("invalid.jwt.token");
      expect(res.statusCode).toBe(401);
    });

    it("should return 401 when token is already revoked", async () => {
      // Arrange
      await seedUser(app);
      const { refreshToken } = await login(app, {
        email: "test@example.com",
        password: "@Password123",
      });
      await postRefreshToken(refreshToken); // first use — revokes it

      // Act
      const res = await postRefreshToken(refreshToken);

      // Assert
      expect(res.statusCode).toBe(401);
    });
  });
});
