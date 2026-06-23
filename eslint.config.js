import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Deno edge functions have their own runtime/imports (Deno global, npm:/jsr:
  // specifiers) and are not part of the Vite/React TS project — don't lint them
  // with the browser-targeted frontend config.
  globalIgnores(['dist', 'supabase/functions']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // ShadCN primitives (§8: never edited) legitimately co-export variant helpers
    // (badgeVariants, buttonVariants) beside their component — a Fast-Refresh
    // concern that doesn't apply to these vendored, rarely-changed files.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
