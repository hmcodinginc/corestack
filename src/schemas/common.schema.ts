import { z } from 'zod';
import { STATUS } from '@/constants/status';

// Common Zod validators to enforce DRY principles
export const stringRequired = (message: string) => 
  z.string().min(1, { message }).trim();

export const emailRequired = (message: string = 'Valid email is required') => 
  z.string().email({ message }).trim();

export const phoneOptional = z.string().trim().optional();

export const statusValidator = z.enum([STATUS.ACTIVE, STATUS.INACTIVE, STATUS.PENDING]);

export const uuidValidator = z.string().uuid({ message: 'Invalid ID format' });

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});
