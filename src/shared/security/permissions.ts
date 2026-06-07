export type Role = 'user' | 'premium' | 'admin' | 'moderator';
export type Permission = string;

const rolePermissions: Record<Role, Permission[]> = {
  user: [
    'profile:read',
    'profile:write',
    'resume:upload',
    'resume:read',
    'discovery:feed',
    'discovery:swipe',
    'application:create',
    'application:read',
    'referral:request',
  ],
  premium: [
    'profile:read',
    'profile:write',
    'resume:upload',
    'resume:read',
    'resume:analyze',
    'discovery:feed',
    'discovery:swipe',
    'application:create',
    'application:read',
    'referral:request',
    'analytics:read',
    'ai:extended',
  ],
  moderator: [
    'profile:read',
    'profile:write',
    'resume:upload',
    'resume:read',
    'discovery:feed',
    'discovery:swipe',
    'application:create',
    'application:read',
    'application:moderate',
    'referral:request',
    'content:moderate',
    'reports:read',
  ],
  admin: ['*'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

export function getRolePermissions(role: Role): readonly Permission[] {
  return rolePermissions[role] ?? [];
}

export function authorize(role: Role, permission: Permission): boolean {
  return hasPermission(role, permission);
}
