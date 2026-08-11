import { AppNotification, NotificationPreference, NotificationTemplate, Reminder, CommunicationLog, NotificationPriority, NotificationModule, CommunicationChannel } from '@/types';
import { StorageService } from './StorageService';
import { activityLogService } from './ActivityLogService';

class NotificationService extends StorageService<AppNotification> {
  constructor() {
    super('corestack_notifications');
  }

  // Framework-independent event dispatch
  private dispatchNotificationEvent() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('corestack:notify'));
    }
  }

  public async createNotification(
    title: string,
    message: string,
    type: string,
    priority: NotificationPriority,
    recipientId: string,
    module: NotificationModule,
    relatedRecordId?: string,
    actionUrl?: string
  ): Promise<AppNotification> {
    const notification = await this.create({
      title,
      message,
      type,
      priority,
      recipientId,
      module,
      relatedRecordId,
      actionUrl,
      status: 'UNREAD',
    });
    
    this.dispatchNotificationEvent();
    
    activityLogService.log({
      action: 'Create',
      module: 'Notifications',
      entityType: 'Notification',
      entityId: notification.id,
      entityName: notification.title,
      description: `Notification "${notification.title}" created for user ${recipientId}`,
      severity: 'Info'
    });

    return notification;
  }

  public async getUnreadForUser(userId: string): Promise<AppNotification[]> {
    const all = await this.getAll();
    // Demo bypass: show all unread to current user
    return all.filter(n => n.status === 'UNREAD');
  }

  public async getAllForUser(userId: string): Promise<AppNotification[]> {
    const all = await this.getAll();
    // Demo bypass: show all notifications so the user can test the flows
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async markAsRead(id: string): Promise<AppNotification> {
    const updated = await this.update(id, { status: 'READ', readAt: new Date().toISOString() });
    this.dispatchNotificationEvent();
    
    activityLogService.log({
      action: 'Update',
      module: 'Notifications',
      entityType: 'Notification',
      entityId: updated.id,
      entityName: updated.title,
      description: `Notification marked as read`,
      severity: 'Info'
    });

    return updated;
  }

  public async markAsUnread(id: string): Promise<AppNotification> {
    const updated = await this.update(id, { status: 'UNREAD', readAt: undefined });
    this.dispatchNotificationEvent();
    return updated;
  }

  public async markAllAsRead(userId: string): Promise<void> {
    const all = this.readData(); // synchronous internal read
    let changed = false;
    
    for (let i = 0; i < all.length; i++) {
      if (all[i].status === 'UNREAD') {
        all[i].status = 'READ';
        all[i].readAt = new Date().toISOString();
        changed = true;
      }
    }

    if (changed) {
      this.writeData(all);
      this.dispatchNotificationEvent();
    }
  }

  public async deleteNotification(id: string): Promise<void> {
    const all = this.readData();
    const filtered = all.filter(n => n.id !== id);
    this.writeData(filtered);
    this.dispatchNotificationEvent();
  }

  public async clearAll(userId: string): Promise<void> {
    const all = this.readData();
    const filtered = all.filter(n => n.recipientId !== userId);
    this.writeData(filtered);
    this.dispatchNotificationEvent();
  }
}

class NotificationPreferenceService extends StorageService<NotificationPreference> {
  constructor() {
    super('corestack_notification_preferences');
  }
  
  public async getPreferences(userId: string): Promise<NotificationPreference[]> {
    const all = await this.getAll();
    return all.filter(p => p.userId === userId);
  }
}

class NotificationTemplateService extends StorageService<NotificationTemplate> {
  constructor() {
    super('corestack_notification_templates');
  }
}

class ReminderService extends StorageService<Reminder> {
  constructor() {
    super('corestack_reminders');
  }
  
  public async getActiveRemindersForUser(userId: string): Promise<Reminder[]> {
    const all = await this.getAll();
    return all.filter(r => r.recipientId === userId && r.status === 'PENDING');
  }
}

class CommunicationService extends StorageService<CommunicationLog> {
  constructor() {
    super('corestack_communication_logs');
  }
  
  public async logCommunication(
    recipientId: string,
    channel: CommunicationChannel,
    subject: string,
    message: string,
    relatedClientId?: string,
    relatedRecordId?: string
  ): Promise<CommunicationLog> {
    return this.create({
      date: new Date().toISOString(),
      recipientId,
      channel,
      subject,
      message,
      relatedClientId,
      relatedRecordId,
      status: 'SENT' // In prototype, assume success
    });
  }
}

export const notificationService = new NotificationService();
export const notificationPreferenceService = new NotificationPreferenceService();
export const notificationTemplateService = new NotificationTemplateService();
export const reminderService = new ReminderService();
export const communicationService = new CommunicationService();
