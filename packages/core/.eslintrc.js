/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...require("@simplilms/config/eslint/base"),
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
};
