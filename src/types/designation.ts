import { ArchiveEntity } from './index';
import { StatusType } from '@/constants/status';

export interface Designation extends ArchiveEntity {
  name: string;
  code: string;
  description?: string;
  departmentId?: string; // Optional mapping
  hierarchyLevel: number; // For reporting/ordering
  status: StatusType | string;
  color?: string;
  icon?: string;
  
  // Computed
  employeeCount?: number;
  departmentName?: string;
}

export interface DesignationStats {
  total: number;
  active: number;
  archived: number;
}
