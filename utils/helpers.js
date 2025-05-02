// utils/helpers.js

/**
 * Convert a string into a slug (lowercase, spaces replaced by hyphens).
 * @param {string} text
 * @returns {string} Slugified string
 */
function slugify(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }
  
  module.exports = { slugify };
  