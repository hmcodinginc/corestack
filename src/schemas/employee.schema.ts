import { z } from 'zod';
import { stringRequired, statusValidator } from './common.schema';

export const employeeSchema = z.object({
  // Personal
  firstName: stringRequired('First name is required').min(2).max(50),
  lastName: stringRequired('Last name is required').min(2).max(50),
  avatar: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dob: stringRequired('Date of birth is required'),
  mobile: stringRequired('Mobile number is required').regex(/^\+?[0-9\s-]{10,15}$/, 'Invalid mobile format'),
  email: stringRequired('Email is required').email('Invalid email address'),
  address: z.string().max(500).optional(),

  // Employment
  employeeId: stringRequired('Employee ID is required').toUpperCase(),
  departmentId: stringRequired('Department is required'),
  roleId: stringRequired('Role is required'),
  designationId: stringRequired('Designation is required'),
  reportingManagerId: z.string().optional(),
  joiningDate: stringRequired('Joining date is required'),
  leavingDate: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  status: statusValidator,

  // Emergency
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactMobile: z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Invalid mobile format').optional().or(z.literal('')),
  emergencyContactRelation: z.string().max(50).optional(),

  // Additional
  notes: z.string().max(1000).optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
