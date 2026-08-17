import { ArchiveEntity } from './index';
import { StatusType } from '@/constants/status';

export type PermissionAction = 'view' | 'create' | 'edit' | 'archive' | 'restore' | 'export' | 'assign' | 'approve' | 'manage';
export type AppModule = 
  | 'dashboard' | 'departments' | 'roles' | 'designations' 
  | 'employees' | 'clients' | 'tasks' | 'documents' 
  | 'billing' | 'reports' | 'notifications' | 'settings' | 'activityLogs';

export type PermissionMatrix = Record<AppModule, Record<PermissionAction, boolean>>;

export interface Role extends ArchiveEntity {
  name: string;
  code: string;
  description?: string;
  hierarchyLevel: number; // e.g., 1 for Owner, 2 for Partner, etc.
  status: StatusType | string;
  color?: string;
  icon?: string;
  permissions: PermissionMatrix;
  
  // Computed
  employeeCount?: number;
}

export interface RoleStats {
  total: number;
  active: number;
  archived: number;
}
