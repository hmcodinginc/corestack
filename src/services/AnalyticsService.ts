import { clientService } from './ClientService';
import { employeeService } from './EmployeeService';
import { taskService } from './TaskService';
import { invoiceService } from './BillingService';
import { documentService } from './DocumentService';

export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  totalEmployees: number;
  totalRevenue: number;
  outstandingPayments: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalDocuments: number;
}

export class AnalyticsService {
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [clients, employees, tasks, invoices, documents] = await Promise.all([
      clientService.getAll(),
      employeeService.getAll(),
      taskService.getAll(),
      invoiceService.getAll(),
      documentService.getAll()
    ]);

    const activeClients = clients.filter(c => !c.isArchived);
    const activeEmployees = employees.filter(e => !e.isArchived && e.status === 'ACTIVE');
    const validTasks = tasks.filter(t => !t.isArchived);
    const validInvoices = invoices.filter(i => !i.isArchived && i.type === 'INVOICE');
    const validDocs = documents.filter(d => !d.isArchived);

    let totalRevenue = 0;
    let outstandingPayments = 0;
    validInvoices.forEach(inv => {
      totalRevenue += inv.paidAmount;
      outstandingPayments += inv.balanceAmount;
    });

    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;
    const now = new Date();

    validTasks.forEach(t => {
      if (t.status === 'COMPLETED') {
        completedTasks++;
      } else {
        if (t.status === 'PENDING' || t.status === 'ASSIGNED') pendingTasks++;
        if (t.dueDate && new Date(t.dueDate) < now) overdueTasks++;
      }
    });

    return {
      totalClients: activeClients.length,
      activeClients: activeClients.filter(c => c.status === 'ACTIVE').length,
      totalEmployees: activeEmployees.length,
      totalRevenue,
      outstandingPayments,
      totalTasks: validTasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalDocuments: validDocs.length
    };
  }

  public async getRevenueTrendData() {
    const invoices = await invoiceService.getAll();
    const valid = invoices.filter(i => !i.isArchived && i.type === 'INVOICE');
    
    // Group by month
    const months: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      months[key] = 0;
    }

    valid.forEach(inv => {
      const d = new Date(inv.billingDate);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      if (months[key] !== undefined) {
        months[key] += inv.totalAmount;
      }
    });

    return Object.entries(months).map(([name, Revenue]) => ({ name, Revenue }));
  }

  public async getTaskStatusDistribution() {
    const tasks = await taskService.getAll();
    const valid = tasks.filter(t => !t.isArchived);
    
    const dist = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, OTHER: 0 };
    valid.forEach(t => {
       if (t.status === 'PENDING' || t.status === 'ASSIGNED') dist.PENDING++;
       else if (t.status === 'IN_PROGRESS' || t.status === 'UNDER_REVIEW') dist.IN_PROGRESS++;
       else if (t.status === 'COMPLETED') dist.COMPLETED++;
       else dist.OTHER++;
    });

    return [
      { name: 'Pending', value: dist.PENDING },
      { name: 'In Progress', value: dist.IN_PROGRESS },
      { name: 'Completed', value: dist.COMPLETED },
      { name: 'Other', value: dist.OTHER },
    ].filter(d => d.value > 0);
  }
}

export const analyticsService = new AnalyticsService();
