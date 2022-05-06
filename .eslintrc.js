module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint"],
  rules: {},
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  globals: {
    chrome: true,
  },
};
