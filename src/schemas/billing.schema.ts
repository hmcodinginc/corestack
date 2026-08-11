import { z } from 'zod';
import { stringRequired } from './common.schema';

export const invoiceItemSchema = z.object({
  id: z.string(),
  description: stringRequired('Description is required'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative'),
  amount: z.coerce.number().min(0)
});

export const invoiceSchema = z.object({
  type: z.enum(['INVOICE', 'QUOTATION']).default('INVOICE'),
  clientId: stringRequired('Client is required'),
  departmentId: z.string().optional(),
  taskIds: z.array(z.string()).default([]),
  
  billingDate: stringRequired('Billing Date is required'),
  dueDate: stringRequired('Due Date is required'),
  
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  taxPercentage: z.coerce.number().min(0).max(100).default(18), // Default GST
  
  status: z.enum(['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'ARCHIVED']),
  notes: z.string().optional(),
  terms: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.billingDate && data.dueDate) {
    if (new Date(data.billingDate) > new Date(data.dueDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Due date cannot be before Billing date',
        path: ['dueDate'],
      });
    }
  }

  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const discountAmount = subtotal * ((data.discountPercentage || 0) / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * ((data.taxPercentage || 0) / 100);
  const totalAmount = afterDiscount + taxAmount;

  if (totalAmount <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Total amount must be greater than 0. Please adjust your line items or discount.',
      path: ['items'],
    });
  }
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const paymentSchema = z.object({
  invoiceId: stringRequired('Invoice is required'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  paymentDate: stringRequired('Payment Date is required'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD', 'OTHER']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (['BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD'].includes(data.paymentMethod)) {
    if (!data.referenceNumber || data.referenceNumber.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Reference number is required for this payment method',
        path: ['referenceNumber'],
      });
    }
  }
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
