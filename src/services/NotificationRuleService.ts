import { taskService } from './TaskService';
import { invoiceService } from './BillingService';
import { documentService } from './DocumentService';
import { notificationService } from './NotificationService';

/**
 * NotificationRuleService executes background checks to generate
 * system notifications based on time and state rules.
 * It remains independent of React components.
 */
export class NotificationRuleService {
  
  /**
   * Evaluates all system rules and generates notifications if conditions are met.
   * This can be called on app initialization or on a polling interval.
   */
  public static async evaluateRules(currentUserId: string): Promise<void> {
    await Promise.all([
      this.checkOverdueTasks(currentUserId),
      this.checkOverdueInvoices(currentUserId),
      this.checkExpiringDocuments(currentUserId)
    ]);
  }

  private static async checkOverdueTasks(currentUserId: string) {
    const tasks = await taskService.getAll();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Filter tasks that are pending, assigned to the user, and past the due date.
    const overdueTasks = tasks.filter(t => 
      !t.isArchived && 
      (t.status === 'PENDING' || t.status === 'ASSIGNED') &&
      t.dueDate &&
      t.dueDate < todayStr &&
      t.employeeIds.includes(currentUserId)
    );

    // Filter tasks due exactly today
    const dueTodayTasks = tasks.filter(t => 
      !t.isArchived && 
      (t.status === 'PENDING' || t.status === 'ASSIGNED') &&
      t.dueDate === todayStr &&
      t.employeeIds.includes(currentUserId)
    );

    // In a real system, we'd check if a notification was already sent today to avoid duplicates.
    // For this prototype, we'll fetch existing notifications to prevent duplicate span.
    const existingNotifications = await notificationService.getAllForUser(currentUserId);
    
    // Seed a welcome notification if literally 0 notifications exist
    if (existingNotifications.length === 0) {
       await notificationService.createNotification(
         'System Notifications Active',
         'Welcome to the new CoreStack Notification Center. Your alerts will appear here.',
         'System Update',
         'LOW',
         currentUserId,
         'SYSTEM',
         'sys-1',
         '/notifications'
       );
    }

    for (const task of overdueTasks) {
      const alreadyNotified = existingNotifications.some(n => 
        n.relatedRecordId === task.id && n.type === 'Task Overdue'
      );
      if (!alreadyNotified) {
        await notificationService.createNotification(
          `Task Overdue: ${task.taskName}`,
          `This task was due on ${task.dueDate}. Please take action.`,
          'Task Overdue',
          'HIGH',
          currentUserId,
          'TASKS',
          task.id,
          `/tasks/${task.id}`
        );
      }
    }

    for (const task of dueTodayTasks) {
      const alreadyNotified = existingNotifications.some(n => 
        n.relatedRecordId === task.id && n.type === 'Task Due Today'
      );
      if (!alreadyNotified) {
        await notificationService.createNotification(
          `Task Due Today: ${task.taskName}`,
          `This task is due today. Ensure it is completed.`,
          'Task Due Today',
          'NORMAL',
          currentUserId,
          'TASKS',
          task.id,
          `/tasks/${task.id}`
        );
      }
    }
  }

  private static async checkOverdueInvoices(currentUserId: string) {
    // Invoices overdue would typically notify the manager or the billing admin.
    const invoices = await invoiceService.getAll();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const overdueInvoices = invoices.filter(i => 
      !i.isArchived && 
      i.type === 'INVOICE' &&
      i.status !== 'PAID' &&
      i.dueDate &&
      i.dueDate < todayStr
    );

    const existingNotifications = await notificationService.getAllForUser(currentUserId);

    for (const inv of overdueInvoices) {
      // Assuming currentUserId is authorized to see this. (We'd typically fetch clients managerId here)
      const alreadyNotified = existingNotifications.some(n => 
        n.relatedRecordId === inv.id && n.type === 'Invoice Overdue'
      );
      if (!alreadyNotified) {
        await notificationService.createNotification(
          `Invoice Overdue: ${inv.invoiceNumber}`,
          `Invoice for ${inv.clientName || 'Client'} is overdue since ${inv.dueDate}. Balance: ₹${(inv.balanceAmount || 0).toFixed(2)}`,
          'Invoice Overdue',
          'CRITICAL',
          currentUserId,
          'BILLING',
          inv.id,
          `/billing/${inv.id}`
        );
      }
    }
  }

  private static async checkExpiringDocuments(currentUserId: string) {
    // Similarly check document expiration (e.g., expiryDate < today + 7 days)
    // Omitted loop for brevity, same pattern.
  }
}
