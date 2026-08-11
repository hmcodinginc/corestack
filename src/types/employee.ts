import { ArchiveEntity } from './index';
import { StatusType } from '@/constants/status';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Employee extends ArchiveEntity {
  // Personal
  firstName: string;
  lastName: string;
  avatar?: string;
  gender: Gender;
  dob: string;
  mobile: string;
  email: string;
  address?: string;

  // Employment
  employeeId: string;
  departmentId: string;
  roleId: string;
  designationId: string;
  reportingManagerId?: string;
  joiningDate: string;
  leavingDate?: string;
  employmentType: EmploymentType;
  status: StatusType | string;

  // Emergency
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  emergencyContactRelation?: string;

  // Additional
  skills?: string[];
  notes?: string;

  // Computed Context (for DataTables without expensive joins)
  departmentName?: string;
  roleName?: string;
  designationName?: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  newThisMonth: number;
}
