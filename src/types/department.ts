import { ArchiveEntity } from './index';
import { StatusType } from '@/constants/status';

export interface Department extends ArchiveEntity {
  name: string;
  code: string;
  description?: string;
  head?: string;
  status: StatusType | string;
  color?: string;
  icon?: string;
  
  // Computed fields (often hydrated from other services in a real backend)
  employeeCount?: number;
  activeEmployeeCount?: number;
}

export interface DepartmentStats {
  total: number;
  active: number;
  archived: number;
}
