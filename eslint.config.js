import { eslintConfig } from '@tetherto/tether-dev-docs'

export default [
  ...eslintConfig,
  {
    plugins: eslintConfig[0].plugins,
    languageOptions: {
      globals: {
        chrome: 'readonly',
        browser: 'readonly'
      }
    },
    rules: {
      'no-underscore-dangle': 'off',
      'prettier/prettier': [
        'error',
        {
          ...eslintConfig[0].rules['prettier/prettier'][1],
          plugins: ['prettier-plugin-tailwindcss']
        }
      ]
    }
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^React$',
          ignoreRestSiblings: true
        }
      ]
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^React$',
          ignoreRestSiblings: true
        }
      ]
    }
  }
]
