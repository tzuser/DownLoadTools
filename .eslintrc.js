module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        indent: ['error', 2],
        'no-unused-vars': 1,
        'no-console': 1,
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
    },
};
