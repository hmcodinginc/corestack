export const ROLE_HIERARCHY = [
  'Super Admin',
  'Partner',
  'Manager',
  'Senior Accountant',
  'Accountant',
  'Tax Executive',
  'Receptionist',
] as const;

export type RoleHierarchyType = typeof ROLE_HIERARCHY[number];

// Used to check if a user can perform actions on another role (cannot manage higher roles)
export const getRoleLevel = (role: RoleHierarchyType | string): number => {
  const index = ROLE_HIERARCHY.indexOf(role as RoleHierarchyType);
  return index !== -1 ? index : 999; 
};
