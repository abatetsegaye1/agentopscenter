/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/components"],
  testMatch: ["**/*.spec.tsx"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          module: "commonjs",
          esModuleInterop: true
        }
      }
    ]
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  }
};
