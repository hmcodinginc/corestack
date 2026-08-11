import { ArchiveEntity, StatusType } from './index';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type NotificationModule = 'TASKS' | 'DOCUMENTS' | 'CLIENTS' | 'BILLING' | 'PAYMENTS' | 'REPORTS' | 'SYSTEM' | 'SECURITY' | 'EMPLOYEES';
export type CommunicationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PUSH' | 'PHONE';

export interface AppNotification extends ArchiveEntity {
  title: string;
  message: string;
  type: string; // e.g. 'Task Assigned', 'Invoice Overdue'
  priority: NotificationPriority;
  recipientId: string; // User/Employee ID
  module: NotificationModule;
  relatedRecordId?: string; // ID of the specific Task, Client, etc.
  readAt?: string; // ISO string if read
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  actionUrl?: string; // e.g. '/tasks/123'
}

export interface NotificationPreference extends ArchiveEntity {
  userId: string;
  module: NotificationModule;
  inApp: boolean;
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
  push: boolean;
}

export interface NotificationTemplate extends ArchiveEntity {
  templateName: string;
  type: string;
  titleTemplate: string; // e.g. "Task Assigned"
  messageTemplate: string; // e.g. "{{employeeName}} has been assigned task {{taskName}}"
  module: NotificationModule;
  status: StatusType;
}

export interface Reminder extends ArchiveEntity {
  type: string; // e.g. 'Task Due', 'Invoice Overdue'
  relatedRecordId: string;
  recipientId: string;
  reminderDate: string;
  reminderTime: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  message: string;
}

export interface CommunicationLog extends ArchiveEntity {
  date: string;
  recipientId: string;
  channel: CommunicationChannel;
  subject: string;
  message: string;
  relatedClientId?: string;
  relatedRecordId?: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
}

// Future Provider Interfaces (Prepared Architecture)
export interface CommunicationProvider {
  send(recipient: string, message: string, subject?: string): Promise<boolean>;
}

export interface EmailProvider extends CommunicationProvider {}
export interface SMSProvider extends CommunicationProvider {}
export interface WhatsAppProvider extends CommunicationProvider {}
export interface PushProvider extends CommunicationProvider {}
