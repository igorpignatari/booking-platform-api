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

async function postLogoutAllDevices(body: unknown) {
  return app.http.inject({
    method: "POST",
    url: "/auth/logout-all-devices",
    headers: { "content-type": "application/json" },
    payload: body,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /auth/logout-all-devices (e2e)", () => {
  describe("200 OK", () => {
    it("should return 200 and revoke all tokens for the user", async () => {
      // Arrange — simulate 3 logins (3 devices)
      const user = await seedUser(app);
      await login(app, { email: user.email, password: "@Password123" });
      await login(app, { email: user.email, password: "@Password123" });
      await login(app, { email: user.email, password: "@Password123" });

      // Act
      const res = await postLogoutAllDevices({ userId: user.id });

      // Assert
      expect(res.statusCode).toBe(200);

      const rows = await app.db.manyOrNone<{ revoked_at: string | null }>(
        "SELECT revoked_at FROM auth WHERE user_id = $1",
        [user.id],
      );
      expect(rows).toHaveLength(3);
      expect(rows.every((r) => r.revoked_at !== null)).toBe(true);
    });

    it("should return 200 when user has no active tokens (noop)", async () => {
      // Arrange
      const user = await seedUser(app);

      // Act
      const res = await postLogoutAllDevices({ userId: user.id });

      // Assert
      expect(res.statusCode).toBe(200);
    });

    it("should not affect tokens from other users", async () => {
      // Arrange
      const user1 = await seedUser(app, { email: "user1@example.com" });
      const user2 = await seedUser(app, { email: "user2@example.com" });

      await login(app, { email: user1.email, password: "@Password123" });
      await login(app, { email: user2.email, password: "@Password123" });

      // Act
      await postLogoutAllDevices({ userId: user1.id });

      // Assert — user2's token still active
      const row = await app.db.oneOrNone<{ revoked_at: string | null }>(
        "SELECT revoked_at FROM auth WHERE user_id = $1",
        [user2.id],
      );
      expect(row?.revoked_at).toBeNull();
    });
  });

  describe("422 Unprocessable Entity", () => {
    it("should return 422 when userId is missing", async () => {
      const res = await postLogoutAllDevices({});
      expect(res.statusCode).toBe(422);
    });
  });
});
