module.exports = {
  root: true,
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    // Add any project-specific rules here
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_.*' },
    ],
  },
}; 