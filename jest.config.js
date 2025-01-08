module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1'
  },
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  testTimeout: 10000
} 