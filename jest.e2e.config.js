process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5433/test_db";
process.env.JWT_SECRET = "test-jwt-secret-must-be-at-least-32-chars!!";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-must-be-at-least-32!!";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.LOG_LEVEL = "error";
process.env.BCRYPT_ROUNDS = "4";
process.env.PORT = "3001";
process.env.HOST = "0.0.0.0";
process.env.APP_NAME = "booking-api-test";

const config = {
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/__tests__/e2e/**/*.e2e.test.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
          target: "es2022",
          keepClassNames: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@contexts/(.*)$": "<rootDir>/src/contexts/$1",
    "^@main/(.*)$": "<rootDir>/src/main/$1",
  },
  testTimeout: 30_000,
  maxWorkers: 1,
  clearMocks: true,
  restoreMocks: true,
};

module.exports = config;
