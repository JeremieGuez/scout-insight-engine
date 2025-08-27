import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";

export default tseslint.config(
  // Ignorer le build
  { ignores: ["dist"] },

  // Config principale TypeScript + React
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: pluginImport,
    },
    rules: {
      // Bonnes pratiques react-hooks
      ...reactHooks.configs.recommended.rules,

      // React Fast Refresh : prévenir certains patterns
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // TS : on tolère les vars non utilisées (souvent temporaire en dev)
      "@typescript-eslint/no-unused-vars": "off",

      // 👉 Interdit les imports relatifs parent (`../`)
      "import/no-relative-parent-imports": "error",

      // (Optionnel) Un peu d’ordre dans les imports
      // "import/order": ["warn", {
      //   "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
      //   "newlines-between": "always",
      //   "alphabetize": { "order": "asc", "caseInsensitive": true },
      //   "pathGroups": [{ "pattern": "@/**", "group": "internal" }],
      //   "pathGroupsExcludedImportTypes": ["builtin"],
      // }],
    },
  }
);
