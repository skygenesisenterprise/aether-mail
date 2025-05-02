// tests/helpers.test.js

const { slugify } = require('../utils/helpers');

describe('Helper Functions', () => {
  it('should slugify a title correctly', () => {
    const title = 'Hello World! This is a test.';
    const slug = slugify(title);
    expect(slug).toBe('hello-world-this-is-a-test');
  });
});

describe('slugify function', () => {
    it('should convert a string to a slug', () => {
        const input = 'Hello World! This is a test.';
        const expectedOutput = 'hello-world-this-is-a-test';
        expect(slugify(input)).toBe(expectedOutput);
    });
    
    it('should handle empty strings', () => {
        const input = '';
        const expectedOutput = '';
        expect(slugify(input)).toBe(expectedOutput);
    });
    
    it('should handle strings with special characters', () => {
        const input = 'Hello @World! #Test';
        const expectedOutput = 'hello-world-test';
        expect(slugify(input)).toBe(expectedOutput);
    });
});