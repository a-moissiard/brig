module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  globals: {
    cy: true,
    Cypress: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        argsIgnorePattern: 'res|next|stage|^err|on|config|e|_',
      },
    ],
    'arrow-body-style': [2, 'as-needed'],
    'no-param-reassign': [
      2,
      {
        props: false,
      },
    ],
    'no-unused-expressions': [
      1,
      {
        allowTaggedTemplates: true,
      },
    ],
    quotes: 'off',
    '@typescript-eslint/quotes': [
      2,
      'single',
      {
        avoidEscape: true,
      },
    ],
    'no-console': ['warn', { allow: ['warn'] }],
    'spaced-comment': [2, 'always', { exceptions: ['-', '+'], markers: ['/'] }],
    'no-use-before-define': 0,
    'no-plusplus': 0,
    'no-continue': 0,
    'linebreak-style': 0,
    import: 0,
    camelcase: 1,
    'import/no-unresolved': 0,
    'func-names': 0,
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,
    'import/no-cycle': 0,
    'space-before-function-paren': 0,
    'import/extensions': 0,
    indent: ['error', 2, { SwitchCase: 1 }],
  },
}
