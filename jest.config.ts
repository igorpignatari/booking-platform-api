import type { Config } from "jest";

const config: Config = {
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts", "<rootDir>/src/**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/integration/", "/__tests__/e2e/"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            decorators: true,
          },
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
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/main.ts", "!src/**/*.errors.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  clearMocks: true,
  restoreMocks: true,
};

export default config;
