export default [
  {
    files: ["src/**/*.{js,ts}"], // Adjust the pattern to match your file structure
    languageOptions: {
      parser: "@typescript-eslint/parser", // Use TypeScript parser for `.ts` files
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": "warn", // Example rule: warn for unused variables
      "semi": ["error", "always"], // Example rule: enforce semicolons
    },
  },
];
