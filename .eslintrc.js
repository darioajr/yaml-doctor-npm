module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'prefer-const': 'off',
    'no-var': 'off',
    'no-unused-vars': 'off',
    'no-console': 'off',
    'semi': 'off',
    'quotes': 'off',
    'no-undef': 'off',
  },
};
