import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          target: 'es2022',
          ignoreDeprecations: '6.0',
        },
      },
    ],
  },
  clearMocks: true,
  cache: true,
  cacheDirectory: '.jest-cache',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: '.coverage',
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
};

export default config;
