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
    // Scripts legacy y utilitarios de Node (no forman parte del build)
    "scripts/legacy/**",
    "scripts/run-seed.cjs",
    "public/sw.js",
  ]),
  {
    rules: {
      // Allow 'any' type but warn about it
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Note: react-hooks rules are already included in eslint-config-next
      // Diagnosticos advisory del React Compiler: no bloquean, se corrigen gradualmente
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      // Estilisticas: no bloquean el build
      "react/no-unescaped-entities": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    }
  }
]);

export default eslintConfig;