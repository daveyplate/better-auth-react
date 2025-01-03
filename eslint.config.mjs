import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import stylistic from "@stylistic/eslint-plugin"

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    ignores: ["node_modules/*", "dist/*", "src/components/ui/*",],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } }, },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      "react": {
        "version": "19"
      }
    },
    plugins: {
      "@stylistic": stylistic
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "@stylistic/quotes": "warn",
      "@stylistic/jsx-newline": ["warn", { "prevent": true, "allowMultilines": true }],
      "@stylistic/jsx-max-props-per-line": ["warn", { "maximum": 1, "when": "multiline" }],
      "@stylistic/jsx-one-expression-per-line": "warn",
      "@stylistic/jsx-first-prop-new-line": "warn",
      "@stylistic/jsx-closing-bracket-location": "warn",
      "@stylistic/jsx-self-closing-comp": "warn",
      "@stylistic/no-multiple-empty-lines": ["warn", { "max": 1, "maxEOF": 0 }],
    },
  }
]