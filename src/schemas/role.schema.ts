import { z } from 'zod';
import { stringRequired, statusValidator } from './common.schema';

const permissionActionsSchema = z.object({
  view: z.boolean().default(false),
  create: z.boolean().default(false),
  edit: z.boolean().default(false),
  archive: z.boolean().default(false),
  restore: z.boolean().default(false),
  export: z.boolean().default(false),
  assign: z.boolean().default(false),
  approve: z.boolean().default(false),
  manage: z.boolean().default(false),
});

const permissionMatrixSchema = z.record(z.string(), permissionActionsSchema);

export const roleSchema = z.object({
  name: stringRequired('Role name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  code: stringRequired('Role code is required')
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .toUpperCase(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  hierarchyLevel: z.coerce.number().min(1, 'Hierarchy level must be at least 1'),
  status: statusValidator,
  color: z.string().optional(),
  icon: z.string().optional(),
  permissions: permissionMatrixSchema,
});

export type RoleFormValues = z.infer<typeof roleSchema>;
