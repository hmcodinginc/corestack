import { ArchiveEntity } from './index';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'ARCHIVED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CARD' | 'OTHER';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice extends ArchiveEntity {
  invoiceNumber: string; // Auto-generated e.g. INV-2024-001
  type: 'INVOICE' | 'QUOTATION';
  clientId: string;
  departmentId?: string;
  taskIds: string[]; // Linked completed tasks
  
  billingDate: string;
  dueDate: string;
  
  items: InvoiceItem[];
  
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  
  paidAmount: number;
  balanceAmount: number;
  
  status: InvoiceStatus;
  notes?: string;
  terms?: string;

  // Computed fields
  clientName?: string;
  departmentName?: string;
}

export interface Payment extends ArchiveEntity {
  paymentId: string; // Auto-generated e.g. PAY-001
  invoiceId: string;
  clientId: string;
  
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;

  // Computed
  invoiceNumber?: string;
}

export interface BillingStats {
  totalRevenue: number;
  outstandingAmount: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  draftInvoices: number;
  thisMonthRevenue: number;
  thisYearRevenue: number;
}
