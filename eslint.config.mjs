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
  ]),
  // Layer boundary (CLAUDE.md): components/ may depend on types/config/lib/hooks,
  // NOT services/. Route service calls through a hook instead. Test files are
  // exempt — they import the service module to mock it at that boundary.
  {
    files: ["components/**/*.{ts,tsx}"],
    ignores: ["components/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/services/*", "@/services"],
              message:
                "components must not import services directly — go through a hook (hooks/) per CLAUDE.md layer rules.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
