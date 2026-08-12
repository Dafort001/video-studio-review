import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Historical source snapshots are deliberately excluded from the active
    // TypeScript build and must not dominate the current application lint.
    "archive/**",
  ]),
  {
    rules: {
      // Image review, before/after tools, and signed R2 URLs require the browser
      // to request the exact source object instead of Next.js image rewriting.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
