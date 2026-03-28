import {defineConfig, globalIgnores} from 'eslint/config'
// eslint-disable-next-line
import expoConfig from 'eslint-config-expo/flat.js'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores([
    '**/dist',
    '**/expo-env.d.ts',
    '**/android',
    '**/supabase',
    '.expo',
    '.expo-shared',
    'android',
    'ios',
    '.vscode',
  ]),
  tseslint.configs.recommended,
  expoConfig,
  eslintPluginPrettierRecommended,
  importPlugin.flatConfigs.recommended,
  {
    plugins: {
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
    },

    settings: {
      'import/resolver': {
        typescript: true,
      },
    },

    rules: {
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: '@screens/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@widgets/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@features/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@entities/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@shared/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
        },
      ],
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: 'src/screens',
              from: ['src/application'],
            },
            {
              target: 'src/screens/*/**/*',
              from: 'src/screens/*/index.ts',
            },
            {
              target: 'src/widgets',
              from: ['src/application', 'src/screens'],
            },
            {
              target: 'src/widgets/*/**/*',
              from: 'src/widgets/*/index.ts',
            },
            {
              target: 'src/features',
              from: ['src/application', 'src/screens', 'src/widgets'],
            },
            {
              target: 'src/features/*/**/*',
              from: 'src/features/*/index.ts',
            },
            {
              target: 'src/entities',
              from: ['src/application', 'src/screens', 'src/widgets', 'src/features'],
            },
            {
              target: 'src/entities/*/**/*',
              from: 'src/entities/*/index.ts',
            },
            {
              target: 'src/shared',
              from: [
                'src/application',
                'src/screens',
                'src/widgets',
                'src/features',
                'src/entities',
              ],
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@app/*/*/**',
            '@screens/*/**',
            '@widgets/*/**',
            '@features/*/**',
            '@entities/*/**',
            '@shared/*/*/**',
            '../**/application',
            '../**/screens',
            '../**/widgets',
            '../**/features',
            '../**/entities',
            '../**/shared',
          ],
        },
      ],
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'prettier/prettier': 'error',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
])
