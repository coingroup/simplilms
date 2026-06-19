/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./base.js",
    "next/core-web-vitals",
  ],
  rules: {
    // next/core-web-vitals already includes react and react-hooks rules
    // Downgrade to warnings for existing codebase
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    // React specific relaxations
    "react/display-name": "off",
    "react/no-unescaped-entities": "warn",
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
};
