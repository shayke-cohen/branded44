/**
 * ESLint Configuration for Error Prevention
 * 
 * Additional ESLint rules specifically designed to prevent runtime errors
 * related to undefined property access and type safety.
 */

module.exports = {
  extends: [
    './.eslintrc.js', // Your existing config
  ],
  rules: {
    // Prevent unsafe property access
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',

    // Require null checks
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',

    // Prevent undefined access
    'no-undef': 'error',
    'no-undefined': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',

    // Type safety
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',

    // Array safety
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',

    // Function safety
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/require-await': 'error',

    // Component-specific rules
    'react/prop-types': 'error',
    'react/require-default-props': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // Custom rules for our patterns
    'no-restricted-syntax': [
      'error',
      {
        selector: 'MemberExpression[computed=false][property.name=/^(provider|service|pricing|customer)$/]:not([optional=true])',
        message: 'Use optional chaining (?.) when accessing nested object properties like provider, service, pricing, or customer',
      },
      {
        selector: 'CallExpression[callee.property.name="toFixed"][arguments.length=0]',
        message: 'Always provide precision argument to toFixed() method',
      },
      {
        selector: 'MemberExpression[property.name="length"]:not([optional=true])',
        message: 'Use optional chaining when accessing .length property on potentially undefined arrays',
      },
    ],

    // Custom pattern enforcement
    'no-restricted-patterns': [
      'error',
      {
        pattern: /\.[a-zA-Z]+\.[a-zA-Z]+(?!\?)/, // Detects non-optional chained property access
        message: 'Use optional chaining for nested property access',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
      },
    },
  ],
};
