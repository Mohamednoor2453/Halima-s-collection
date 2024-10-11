import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "prettier/prettier": "error" // Enforce Prettier formatting as errors
    },
    plugins: ["prettier"], // Add Prettier as a plugin
  },
  pluginJs.configs.recommended,
];
