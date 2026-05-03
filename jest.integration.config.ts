import type { Config } from "jest";

const config: Config = {
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/__tests__/integration/**/*.integration.test.ts"],
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
  testTimeout: 60_000,
  maxWorkers: 1,
  clearMocks: true,
  restoreMocks: true,
};

export default config;
