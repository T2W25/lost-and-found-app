const { checkUserRole, getRolePermissions, ROLES } = require('./roles');

describe('checkUserRole', () => {
  test('returns false when user is null', () => {
    expect(checkUserRole(null, ROLES.USER)).toBe(false);
  });

  test('returns false when user has no role', () => {
    const user = { name: 'Test User' };
    expect(checkUserRole(user, ROLES.USER)).toBe(false);
  });

  test('returns true when user has exact role', () => {
    const user = { role: ROLES.USER };
    expect(checkUserRole(user, ROLES.USER)).toBe(true);
  });

  test('returns true when user has higher role than required', () => {
    const user = { role: ROLES.ADMIN };
    expect(checkUserRole(user, ROLES.USER)).toBe(true);
    expect(checkUserRole(user, ROLES.MODERATOR)).toBe(true);
  });

  test('returns false when user has lower role than required', () => {
    const user = { role: ROLES.USER };
    expect(checkUserRole(user, ROLES.ADMIN)).toBe(false);
    expect(checkUserRole(user, ROLES.MODERATOR)).toBe(false);
  });
});