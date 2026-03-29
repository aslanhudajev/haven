/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/reference_app/'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/application/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@widgets/(.*)$': '<rootDir>/src/widgets/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
};
