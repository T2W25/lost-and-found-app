const { sanitizeInput, isValidEmail, checkPasswordStrength, isResourceOwnerOrAdmin, hasAccess } = require('./security');
const { ROLES } = require('./roles');

describe('sanitizeInput', () => {
  test('returns empty string when input is null or undefined', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });

  test('sanitizes HTML special characters', () => {
    const input = '<script>alert("XSS")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;';
    expect(sanitizeInput(input)).toBe(expected);
  });

  test('sanitizes ampersands and quotes', () => {
    const input = 'This & that with "quotes" and \'apostrophes\'';
    const expected = 'This &amp; that with &quot;quotes&quot; and &#039;apostrophes&#039;';
    expect(sanitizeInput(input)).toBe(expected);
  });
});

describe('isValidEmail', () => {
  test('returns true for valid email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  test('returns false for invalid email addresses', () => {
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@example')).toBe(false);
    expect(isValidEmail('user.example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('user@exam ple.com')).toBe(false);
  });
});

describe('checkPasswordStrength', () => {
  test('returns score 0 for empty password', () => {
    const result = checkPasswordStrength('');
    expect(result.score).toBe(0);
    expect(result.feedback).toBe('Password is required');
  });

  test('returns low score for short password', () => {
    const result = checkPasswordStrength('abc123');
    expect(result.score).toBe(2); // 0 for length + 1 for lowercase + 1 for numbers
    expect(result.feedback).toContain('at least 8 characters');
  });

  test('returns high score for strong password', () => {
    const result = checkPasswordStrength('StrongP@ssw0rd');
    expect(result.score).toBe(5); // 1 for length + 1 for uppercase + 1 for lowercase + 1 for numbers + 1 for special
    expect(result.feedback).toBe('');
  });
});