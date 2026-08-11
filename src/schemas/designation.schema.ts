import { z } from 'zod';
import { stringRequired, statusValidator } from './common.schema';

export const designationSchema = z.object({
  name: stringRequired('Designation name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  code: stringRequired('Designation code is required')
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .toUpperCase(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  departmentId: z.string().optional(), // Optional as per business rules
  hierarchyLevel: z.coerce.number().min(1, 'Hierarchy level must be at least 1').default(5),
  status: statusValidator,
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type DesignationFormValues = z.infer<typeof designationSchema>;
