import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
    plugins: ['prettier', 'jsx-a11y'],
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-proptypes': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
      'no-console': ['error', { allow: ['error', 'info'] }],
      // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
      'no-prototype-builtins': 'off',
      // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
      'import/prefer-default-export': 'off',
      // Too restrictive: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md
      'react/destructuring-assignment': 'off',
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          required: {
            some: ['nesting', 'id']
          }
        }
      ],
      'react/prop-types': 0,
      'react/prefer-stateless-function': 2,
      // very unlikely you'll stumble with the radix issue, unless you're trying to be clever with parseInt
      radix: 0,
      // we don't need to return or catch promises for our usage
      // see more here: https://gist.github.com/mwickett/2aecfdeea40daa07d39e11922ae1fe20#gistcomment-2153642
      'promise/always-return': 0,
      'promise/catch-or-return': 0,
      'unicorn/prevent-abbreviations': 0,
      'import/no-cycle': 0, // This option acts weird when using resolvers,
      'unicorn/no-array-reduce': 0,
      'jsx-a11y/control-has-associated-label': 0, // Sometimes, we just wanted a button on its own
      // We don't need to add react declaration in NextJS project
      'react/react-in-jsx-scope': 'off',
      // Kinda unnecessary for our usage
      'unicorn/no-null': 'off',
      'unicorn/expiring-todo-comments': 'off',
      'unicorn/switch-case-braces': 'off',
      'unicorn/no-document-cookie': 'off', // only used for tests
      // React Hook Form needs spreading.
      'react/jsx-props-no-spreading': 'off',
      // This is unneccessary, as we don't use propTypes anymore
      'react/require-default-props': 'off',
      'react/prop-types': 'off',
      'react/no-unused-prop-types': 'off',
      'arrow-body-style': ['error', 'as-needed'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['variable'],
          format: ['camelCase', 'snake_case']
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ]
    },
    overrides: [
      {
        files: ['components/**/*.{ts,tsx,js,jsx}'],
        rules: {
          'arrow-body-style': 'off',
          '@typescript-eslint/naming-convention': 'off'
        }
      },
      {
        files: ['*.ts', '*.tsx'],
        parserOptions: {
          project: ['./tsconfig.json']
        }
      }, // All index.tsx should always go for default export. Useful for Nextjs routing in the future
      {
        files: [
          '*.test.{ts,tsx}',
          'constants.{ts,tsx}',
          'helpers.{ts,tsx}',
          '**/constants/*.{ts,tsx}',
          '**/helpers/*.{ts,tsx}',
          '**/helpers/**'
        ],
        rules: {
          'unicorn/filename-case': 'off'
        }
      }
    ]
  })
]

export default eslintConfig
