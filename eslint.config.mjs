import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecomended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ["dist/"] },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
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
      "no-var": "error",
      "no-empty": "warn",
      "no-empty-pattern": "warn",
      // "no-console": "warn",
      eqeqeq: "warn",
      indent: ["error", 2],
      quotes: ["error", "double"],
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
