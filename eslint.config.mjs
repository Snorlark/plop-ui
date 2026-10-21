import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/.next/**", "**/storybook-static/**", "**/coverage/**", "**/next-env.d.ts", "docs/prototype/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Scrollable regions and code blocks must take focus so keyboard users can scroll them (axe: scrollable-region-focusable).
      "jsx-a11y/no-noninteractive-tabindex": ["error", { roles: ["tabpanel", "region"], tags: ["pre"] }],
    },
  },
  {
    // The library must stay framework-free and render the same on server and client.
    files: ["packages/react/src/**/*.{ts,tsx}"],
    ignores: ["packages/react/src/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["next", "next/*"], message: "packages/react must never import from next/*." }] }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message: "No Math.random() in the library: derive tilt, wobble and jitter from seed() so SSR and hydration match.",
        },
      ],
    },
  },
);
