/**
 * User role definitions
 * - USER: Regular user with basic permissions
 * - MODERATOR: User with additional permissions to moderate content
 * - ADMIN: User with full administrative access
 */
export const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

/**
 * Default role assigned to new users
 */
export const DEFAULT_ROLE = ROLES.USER;

/**
 * Role hierarchy - higher roles include permissions of lower roles
 */
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.MODERATOR]: 2,
  [ROLES.ADMIN]: 3
};

/**
 * Check if a user has a specific role
 * @param {Object} user - The user object
 * @param {string} role - The role to check
 * @returns {boolean} - Whether the user has the specified role
 */
export const checkUserRole = (user, role) => {
  if (!user || !user.role) {
    return false;
  }
  
  const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
  const requiredRoleLevel = ROLE_HIERARCHY[role] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
};

/**
 * Get all permissions available to a role
 * @param {string} role - The role to get permissions for
 * @returns {Array} - Array of permission strings
 */
export const getRolePermissions = (role) => {
  const permissions = {
    [ROLES.USER]: [
      'view:items',
      'create:items',
      'update:own-items',
      'delete:own-items',
      'create:claims',
      'view:own-claims',
      'update:own-profile'
    ],
    [ROLES.MODERATOR]: [
      'view:all-items',
      'update:any-item',
      'verify:claims',
      'view:reported-items'
    ],
    [ROLES.ADMIN]: [
      'manage:users',
      'delete:any-item',
      'resolve:disputes',
      'view:audit-logs',
      'manage:system-settings'
    ]
  };
  
  if (!role || !ROLE_HIERARCHY[role]) {
    return [];
  }
  
  // Collect permissions based on role hierarchy
  let allPermissions = [];
  Object.keys(ROLE_HIERARCHY).forEach(r => {
    if (ROLE_HIERARCHY[r] <= ROLE_HIERARCHY[role]) {
      allPermissions = [...allPermissions, ...(permissions[r] || [])];
    }
  });
  
  return allPermissions;
};