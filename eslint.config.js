import { eslintConfig } from 'tether-dev-docs'

export default [
  ...eslintConfig,
  {
    languageOptions: {
      globals: {
        chrome: 'readonly',
        browser: 'readonly'
      }
    },
    rules: {
      'no-underscore-dangle': 'off',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^React$',
          ignoreRestSiblings: true
        }
      ],
      'prettier/prettier': [
        'error',
        {
          ...eslintConfig[0].rules['prettier/prettier'][1],
          plugins: ['prettier-plugin-tailwindcss']
        }
      ]
    }
  }
]
