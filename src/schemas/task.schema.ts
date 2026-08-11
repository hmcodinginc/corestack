import { z } from 'zod';
import { stringRequired } from './common.schema';

export const taskSchema = z.object({
  taskName: stringRequired('Task Name is required').min(2).max(150),
  clientId: stringRequired('Client is required'),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  employeeIds: z.array(z.string()).default([]),
  
  category: stringRequired('Category is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'UNDER_REVIEW', 'COMPLETED', 'CANCELLED', 'ARCHIVED']),
  
  description: z.string().optional(),
  instructions: z.string().optional(),
  
  startDate: z.string().optional(),
  dueDate: stringRequired('Due Date is required'),
  
  estimatedHours: z.coerce.number().min(0).optional(),
  actualHours: z.coerce.number().min(0).optional(),
  
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),

  checklist: z.array(z.object({
    id: z.string(),
    title: stringRequired('Checklist item title is required'),
    isCompleted: z.boolean().default(false)
  })).default([]),
}).superRefine((data, ctx) => {
  if (data.startDate && data.dueDate) {
    if (new Date(data.startDate) > new Date(data.dueDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Due date cannot be before Start date',
        path: ['dueDate'],
      });
    }
  }
});

export type TaskFormValues = z.infer<typeof taskSchema>;
