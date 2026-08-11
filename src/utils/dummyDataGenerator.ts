import { StorageService } from '@/services/StorageService';
import { STATUS } from '@/constants/status';
import { ROLE_HIERARCHY } from '@/constants/roles';

// Simple interface for departments
interface Dept {
  id: string;
  name: string;
  code: string;
  head: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export const initializeDummyData = async () => {
  const isInitialized = localStorage.getItem('corestack_initialized');
  if (isInitialized) return;

  const deptService = new StorageService<Dept>('departments');
  const roleService = new StorageService<any>('roles');
  
  // Create Departments
  const departments = [
    { name: 'Audit & Assurance', code: 'AUD' },
    { name: 'Taxation (Direct)', code: 'TAX-D' },
    { name: 'Taxation (Indirect)', code: 'TAX-I' },
    { name: 'Corporate Advisory', code: 'ADV' },
    { name: 'Accounting & Payroll', code: 'ACC' },
    { name: 'Compliance', code: 'CMP' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'Finance & Admin', code: 'FIN' },
    { name: 'IT Support', code: 'IT' },
    { name: 'Legal', code: 'LEG' }
  ];

  for (const dept of departments) {
    await deptService.create({
      name: dept.name,
      code: dept.code,
      head: 'Pending',
      status: STATUS.ACTIVE,
    } as any);
  }

  // Create Roles
  for (const roleName of ROLE_HIERARCHY) {
    await roleService.create({
      name: roleName,
      status: STATUS.ACTIVE,
      permissions: {}
    } as any);
  }

  localStorage.setItem('corestack_initialized', 'true');
  console.log('✅ Dummy Data Initialized Successfully');
};
