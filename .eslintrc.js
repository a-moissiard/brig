module.exports = {
    plugins: ['@typescript-eslint', 'simple-import-sort', 'eslint-plugin-import', 'import-newlines'],
    parser: '@typescript-eslint/parser',
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
        indent: ['error', 4, { SwitchCase: 1 }],
        semi: [2, 'always'],
        'no-multiple-empty-lines': ['error', { 'max': 1 }],
        'no-duplicate-imports': 'error',
        'simple-import-sort/imports': ['error', {
            'groups': [
                // Node.js builtins and external
                ['^'],
                // 'parent', 'sibling', 'index'
                ['^\\.'],
                // Style imports.
                ['^.+\\.s?css|less$'],
            ],
        }],
        'no-irregular-whitespace': ['error', {
            'skipStrings': false,
            'skipComments': false,
            'skipRegExps': false,
            'skipTemplates': false,
        }],
        'object-curly-spacing': ['error', 'always'],
        'comma-spacing': ['error', { 'before': false, 'after': true }],
        'import-newlines/enforce': ['error', {
            'max-len': 160,
            'items': Infinity,
            'semi': true,
        }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-empty-interface': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-unused-vars': [
            1,
            {
                argsIgnorePattern: 'res|next|stage|^err|on|config|e|_',
            },
        ],
        '@typescript-eslint/member-delimiter-style': ['error', {
            'multiline': {
                'delimiter': 'semi',
                'requireLast': true,
            },
            'singleline': {
                'delimiter': 'semi',
                'requireLast': false,
            },
        }],
        '@typescript-eslint/quotes': [
            2,
            'single',
            {
                avoidEscape: true,
            },
        ],
        'comma-dangle': 'off',
        '@typescript-eslint/comma-dangle': [
            'error',
            {
                'arrays': 'always-multiline',
                'objects': 'always-multiline',
                'imports': 'always-multiline',
                'exports': 'always-multiline',
                'functions': 'always-multiline',
                'enums': 'always-multiline',
                'generics': 'always-multiline',
                'tuples': 'always-multiline',
            },
        ],
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': ['error', {
                    'allowHigherOrderFunctions': true,
                }],
                '@typescript-eslint/no-floating-promises': ['error'],
            },
            'parserOptions': { 'project': './tsconfig.json' },
        },
    ],
};
