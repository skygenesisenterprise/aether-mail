// tests/logger.test.js

const log = require('../utils/logger');

describe('Logger Utility', () => {
  it('should print info messages', () => {
    console.log = jest.fn();  // Mock console.log
    log.info('Test info message');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]')
    );
  });

  it('should print warning messages', () => {
    console.log = jest.fn();  // Mock console.log
    log.warn('Test warning message');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]')
    );
  });

  it('should print error messages', () => {
    console.error = jest.fn();  // Mock console.error
    log.error('Test error message');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]')
    );
  });
});
