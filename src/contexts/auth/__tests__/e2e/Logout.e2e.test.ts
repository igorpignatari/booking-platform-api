import { JWTServicesImpl } from "@contexts/auth/infra/jwt/JWTServicesImpl";
import { type TestApp, clearAll, createTestApp, login, seedUser } from "./helpers/createTestApp";

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let app: TestApp;
const jwtService = new JWTServicesImpl();

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

async function postLogout(body: unknown) {
  return app.http.inject({
    method: "POST",
    url: "/auth/logout",
    headers: { "content-type": "application/json" },
    payload: body,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /auth/logout (e2e)", () => {
  describe("200 OK", () => {
    it("should return 200 and revoke the token", async () => {
      // Arrange
      await seedUser(app);
      const { refreshToken } = await login(app, {
        email: "test@example.com",
        password: "@Password123",
      });
      const { jti } = jwtService.verifyRefreshToken(refreshToken);

      // Act
      const res = await postLogout({ jti });

      // Assert
      expect(res.statusCode).toBe(200);

      const row = await app.db.oneOrNone<{ revoked_at: string | null }>(
        "SELECT revoked_at FROM auth WHERE jti = $1",
        [jti],
      );
      expect(row?.revoked_at).not.toBeNull();
    });
  });

  describe("401 Unauthorized", () => {
    it("should return 401 when jti does not exist", async () => {
      const res = await postLogout({ jti: crypto.randomUUID() });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("422 Unprocessable Entity", () => {
    it("should return 422 when jti is missing", async () => {
      const res = await postLogout({});
      expect(res.statusCode).toBe(422);
    });

    it("should return 422 when jti is not a valid uuid", async () => {
      const res = await postLogout({ jti: "not-a-uuid" });
      expect(res.statusCode).toBe(422);
    });
  });
});
