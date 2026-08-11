import { z } from 'zod';
import { stringRequired, statusValidator } from './common.schema';

export const departmentSchema = z.object({
  name: stringRequired('Department name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  code: stringRequired('Department code is required')
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .toUpperCase(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  head: z.string().optional(),
  status: statusValidator,
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
