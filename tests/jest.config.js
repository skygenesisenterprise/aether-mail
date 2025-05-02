// tests/jest.config.js

module.exports = {
    testEnvironment: 'node',
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
  };
  