import { defineConfig } from "vitest/config";

// Standalone config (does not load vite.config.ts) so unit tests skip the
// Tailwind/React plugins entirely — they only test pure TS in src/lib.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
