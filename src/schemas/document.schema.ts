import { z } from 'zod';
import { stringRequired, statusValidator } from './common.schema';

export const documentSchema = z.object({
  documentName: stringRequired('Document Name is required').min(2).max(150),
  category: stringRequired('Category is required'),
  clientId: stringRequired('Client is required'),
  departmentId: z.string().optional(),
  
  expiryDate: z.string().optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),

  status: statusValidator.or(z.enum(['PENDING', 'EXPIRED'])),
  
  // Mock file properties that a real file input would populate
  fileSize: z.number().optional().default(0),
  fileType: z.string().optional().default('application/pdf'),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;
