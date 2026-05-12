import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: { NODE_ENV: "development" },
    coverage: {
      provider: "v8",
      exclude: ["src/dto/**", "src/models/**"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
