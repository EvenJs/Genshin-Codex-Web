import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

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
  ]),
  // Relax some strict React rules for common patterns
  {
    rules: {
      // Allow setState in effects for initialization patterns
      "react-hooks/set-state-in-effect": "off",
      // Allow reading refs during render for initialization
      "react-hooks/refs": "off",
    },
  },
  prettier,
]);

export default eslintConfig;
