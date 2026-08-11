import { z } from 'zod';
import { stringRequired, statusValidator } from './common.schema';

export const clientSchema = z.object({
  // General
  clientCode: stringRequired('Client Code is required').toUpperCase(),
  clientType: z.enum(['INDIVIDUAL', 'BUSINESS', 'COMPANY', 'PARTNERSHIP', 'LLP', 'TRUST', 'NGO', 'OTHER'] as const),
  clientName: stringRequired('Client Name is required').min(2).max(100),
  companyName: z.string().max(100).optional(),
  pan: stringRequired('PAN is required').regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').toUpperCase(),
  gst: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format').optional().or(z.literal('')),
  tan: z.string().max(20).optional(),
  cin: z.string().max(30).optional(),
  aadhaar: z.string().regex(/^[0-9]{12}$/, 'Invalid Aadhaar format').optional().or(z.literal('')),

  // Contact
  mobile: stringRequired('Mobile is required').regex(/^[0-9]{10}$/, 'Must be exactly 10 digits'),
  altMobile: z.string().regex(/^[0-9]{10}$/, 'Must be exactly 10 digits').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),

  // Address
  addressLine: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Must be exactly 6 digits').optional().or(z.literal('')),

  // Business
  industry: z.string().max(100).optional(),
  businessCategory: z.string().max(100).optional(),
  annualTurnover: z.string().optional(),
  registrationDate: z.string().optional(),

  // Assignment
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  employeeIds: z.array(z.string()).default([]),

  // Status & Additional
  status: statusValidator,
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'] as const).default('MEDIUM'),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
