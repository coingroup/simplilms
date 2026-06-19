/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    // Downgrade noisy rules to warnings so they don't block CI
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    // Note: @typescript-eslint/no-empty-object-type and no-require-imports were added in v7+
    // Using no-empty-interface (v6 equivalent) instead
    // Allow while(true) loops which are common for streaming/async patterns
    "no-constant-condition": ["error", { checkLoops: false }],
    // Allow empty interfaces (common in TS codebases)
    "@typescript-eslint/no-empty-interface": "off",
    // Allow `{}` type in generics etc.
    "@typescript-eslint/ban-types": "off",
  },
  env: {
    es2022: true,
    node: true,
  },
  ignorePatterns: ["node_modules/", "dist/", ".turbo/", "*.config.js", "*.config.ts"],
};
