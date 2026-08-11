export const PERMISSION_MODULES = [
  'Dashboard',
  'Employees',
  'Departments',
  'Roles',
  'Designations',
  'Clients',
  'Tasks',
  'Documents',
  'Billing',
  'Reports',
  'Settings',
  'Notifications',
  'ActivityLogs'
] as const;

export const PERMISSION_ACTIONS = [
  'View',
  'Create',
  'Edit',
  'Archive',
  'Restore',
  'Export',
  'Assign',
  'Approve'
] as const;

export type PermissionModule = typeof PERMISSION_MODULES[number];
export type PermissionAction = typeof PERMISSION_ACTIONS[number];
