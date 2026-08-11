import { StorageService } from './StorageService';
import { Invoice, Payment, BillingStats } from '@/types/billing';
import { activityLogService } from './ActivityLogService';
import { notificationService } from './NotificationService';
import { settingsService } from './SettingsService';

class InvoiceService extends StorageService<Invoice> {
  constructor() {
    super('invoices');
  }

  private generateInvoiceNumber(type: 'INVOICE' | 'QUOTATION'): string {
    const all = this.readData();
    const count = all.length + 1;
    const year = new Date().getFullYear();
    const prefix = type === 'QUOTATION' ? 'QTN' : settingsService.getSettings().billing.invoicePrefix || 'INV';
    return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
  }

  public calculateTotals(items: any[], discountPct: number, taxPct: number) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discountAmount = subtotal * (discountPct / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxPct / 100);
    const totalAmount = afterDiscount + taxAmount;
    
    return { subtotal, discountAmount, taxAmount, totalAmount };
  }

  public async create(item: any): Promise<Invoice> {
    await this.delay();
    
    const { subtotal, discountAmount, taxAmount, totalAmount } = this.calculateTotals(
      item.items, item.discountPercentage, item.taxPercentage
    );

    const newInvoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'> = {
      ...item,
      invoiceNumber: this.generateInvoiceNumber(item.type),
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      status: item.type === 'QUOTATION' ? 'DRAFT' : item.status,
    };

    const created = await super.create(newInvoice);
    
    await activityLogService.log({
      action: 'Create',
      module: 'Billing',
      entityType: 'Invoice',
      entityId: created.id,
      entityName: created.invoiceNumber,
      description: `Created ${created.type.toLowerCase()} ${created.invoiceNumber}`
    });

    await notificationService.createNotification(
      `New ${created.type} Generated`,
      `${created.type} #${created.invoiceNumber} created for ${created.clientName}. Total: ₹${created.totalAmount}`,
      'Invoice Created',
      'NORMAL',
      'EMP-1', // Mocking admin ID
      'BILLING',
      created.id,
      `/billing/${created.id}`
    );

    return created;
  }

  public async update(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    await this.delay();
    const existing = await this.getById(id);
    if (!existing) throw new Error('Invoice not found');
    if (existing.isArchived) throw new Error('Archived invoices cannot be edited.');

    let updatedFields = { ...updates };

    if (updates.items || updates.discountPercentage !== undefined || updates.taxPercentage !== undefined) {
      const items = updates.items || existing.items;
      const discountPct = updates.discountPercentage ?? existing.discountPercentage;
      const taxPct = updates.taxPercentage ?? existing.taxPercentage;
      
      const { subtotal, discountAmount, taxAmount, totalAmount } = this.calculateTotals(items, discountPct, taxPct);
      
      updatedFields = {
        ...updatedFields,
        subtotal, discountAmount, taxAmount, totalAmount,
        balanceAmount: totalAmount - existing.paidAmount
      };
    }

    const updated = await super.update(id, updatedFields);
    
    await activityLogService.log({
      action: 'Update',
      module: 'Billing',
      entityType: 'Invoice',
      entityId: updated.id,
      entityName: updated.invoiceNumber,
      description: `Updated ${updated.type.toLowerCase()} ${updated.invoiceNumber}`,
      previousValue: existing,
      newValue: updated
    });

    return updated;
  }
}

class PaymentService extends StorageService<Payment> {
  constructor() {
    super('payments');
  }

  private generatePaymentId(): string {
    const all = this.readData();
    const count = all.length + 1;
    return `PAY-${count.toString().padStart(5, '0')}`;
  }

  public async recordPayment(item: any): Promise<Payment> {
    await this.delay();
    const invoice = await invoiceService.getById(item.invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    if (item.amount > invoice.balanceAmount) {
      throw new Error(`Payment amount (${item.amount}) cannot exceed remaining balance (${invoice.balanceAmount})`);
    }

    const newPayment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'> = {
      ...item,
      clientId: invoice.clientId, // inherit from invoice
      paymentId: this.generatePaymentId(),
    };

    const created = await super.create(newPayment);

    // Update Invoice balances
    const newPaidAmount = invoice.paidAmount + created.amount;
    const newBalanceAmount = invoice.totalAmount - newPaidAmount;
    
    let newStatus = invoice.status;
    if (newBalanceAmount === 0) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    await invoiceService.update(invoice.id, {
      paidAmount: newPaidAmount,
      balanceAmount: newBalanceAmount,
      status: newStatus
    });

    await activityLogService.log({
      action: 'Create',
      module: 'Payments',
      entityType: 'Payment',
      entityId: created.id,
      entityName: created.paymentId,
      description: `Recorded payment of ${created.amount} for ${invoice.invoiceNumber}`
    });

    await notificationService.createNotification(
      `Payment Received`,
      `A payment of ₹${created.amount} was recorded for ${invoice.clientName} (${invoice.invoiceNumber}).`,
      'Payment Received',
      'NORMAL',
      'ADMIN', // Use ADMIN or a specific manager ID if available. Or just use invoice.clientId to satisfy string temporarily if no admin ID is set. We can use 'admin'.
      'PAYMENTS',
      created.id,
      `/billing`
    );

    return created;
  }
}

export const invoiceService = new InvoiceService();
export const paymentService = new PaymentService();

export class BillingService {
  async getStats(): Promise<BillingStats> {
    const allInvoices = await invoiceService.getAll();
    const invoices = allInvoices.filter(i => !i.isArchived && i.type === 'INVOICE');
    
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let totalRevenue = 0;
    let outstandingAmount = 0;
    let paidInvoices = 0;
    let unpaidInvoices = 0;
    let overdueInvoices = 0;
    let draftInvoices = 0;
    let thisMonthRevenue = 0;
    let thisYearRevenue = 0;

    invoices.forEach(inv => {
      totalRevenue += inv.paidAmount;
      outstandingAmount += inv.balanceAmount;
      
      if (inv.status === 'PAID') paidInvoices++;
      if (inv.status === 'PARTIALLY_PAID' || inv.status === 'SENT') unpaidInvoices++;
      if (inv.status === 'DRAFT') draftInvoices++;
      
      if (inv.dueDate && new Date(inv.dueDate) < now && inv.balanceAmount > 0) {
         overdueInvoices++;
      }

      const billDate = new Date(inv.billingDate);
      if (billDate.getFullYear() === thisYear) {
         thisYearRevenue += inv.paidAmount;
         if (billDate.getMonth() === thisMonth) {
            thisMonthRevenue += inv.paidAmount;
         }
      }
    });

    return {
      totalRevenue,
      outstandingAmount,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      draftInvoices,
      thisMonthRevenue,
      thisYearRevenue
    };
  }
}

export const billingService = new BillingService();
