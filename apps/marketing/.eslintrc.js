const baseConfig = require("@simplilms/config/eslint/base");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...baseConfig,
  extends: [
    ...(baseConfig.extends || []),
    "next/core-web-vitals",
  ],
  rules: {
    ...(baseConfig.rules || {}),
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "react/display-name": "off",
    "react/no-unescaped-entities": "warn",
    "@next/next/no-html-link-for-pages": "off",
  },
  settings: {
    next: {
      rootDir: ".",
    },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  ignorePatterns: ["node_modules/", ".next/", ".turbo/"],
};
