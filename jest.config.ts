import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageDirectory: ".coverage",
  coverageProvider: "v8",
  coverageReporters: ["json", "text", "lcov", "clover"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          target: "es2022",
          verbatimModuleSyntax: false,
          ignoreDeprecations: "6.0",
        },
      },
    ],
  },
};

export default config;
