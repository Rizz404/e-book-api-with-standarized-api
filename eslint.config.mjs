import pluginJs from "@eslint/js";
import eslintPluginPrettierRecomended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**"],
  },
  { files: ["**/*.{ts,tsx,cts,mts,js,cjs,mjs}"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
  // {
  //   files: ["tests/**/*.{js,mjs,cjs,ts}"],
  //   ...jest.configs["flat/recomended"],
  //   rules: {
  //     ...jest.configs["flat/recomended"].rules,
  //     "jest/prefer-expect-assertions": "off",
  //   },
  // },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": ["warn", { ignoreRestArgs: true }],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variableLike",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
        },
      ],
      "@typescript-eslint/no-namespace": [
        "error",
        {
          allowDeclarations: true,
          allowDefinitionFiles: true,
        },
      ],
      "linebreak-style": 0,
      "no-var": "error",
      "no-empty": "warn",
      "no-empty-pattern": "warn",
      // "no-console": "warn",
      eqeqeq: "warn",
      indent: ["error", 2],
      quotes: ["warn", "double"],
      semi: ["error", "always"],
      "max-len": ["warn", { code: 80 }],
      "comma-dangle": [
        "error",
        {
          functions: "never",
        },
      ],
    },
  },
  eslintPluginPrettierRecomended,
];
