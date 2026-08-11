import { StorageService } from './StorageService';
import { ArchiveEntity, Pagination, Sort, Filters, PageResponse } from '@/types';

export type AuditAction = 
  | 'Create' | 'View' | 'Update' | 'Archive' | 'Restore' | 'Delete' 
  | 'Assign' | 'Reassign' | 'Approve' | 'Reject' | 'Complete' 
  | 'Login' | 'Logout' | 'Export' | 'Import' | 'Download' | 'Upload' 
  | 'Status Changed' | 'Permission Changed' | 'Settings Changed';

export type AuditModule = 
  | 'Dashboard' | 'Departments' | 'Roles' | 'Designations' | 'Employees' 
  | 'Clients' | 'Documents' | 'Tasks' | 'Billing' | 'Payments' 
  | 'Reports' | 'Notifications' | 'Settings' | 'Authentication' | 'System';

export type AuditSeverity = 'Info' | 'Success' | 'Warning' | 'Critical';

export interface AuditLog extends ArchiveEntity {
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  module: AuditModule;
  entityType: string;
  entityId: string;
  entityName: string;
  description: string;
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string; // UI Ready
  device?: string; // UI Ready
  severity: AuditSeverity;
  metadata?: Record<string, any>;
}

export interface LogParams {
  action: AuditAction;
  module: AuditModule;
  entityType: string;
  entityId: string;
  entityName: string;
  description: string;
  severity?: AuditSeverity;
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  metadata?: Record<string, any>;
}

class ActivityLogService extends StorageService<AuditLog> {
  constructor() {
    super('activity_logs');
  }

  // Helper to extract only changed fields between two objects
  private extractChanges(prev: any, curr: any): { prev: Record<string, any>, curr: Record<string, any> } | null {
    if (!prev || !curr) return null;
    if (typeof prev !== 'object' || typeof curr !== 'object') return null;

    const diffPrev: Record<string, any> = {};
    const diffCurr: Record<string, any> = {};
    let hasChanges = false;

    // Ignore fields that are noisy or irrelevant
    const ignoreFields = ['id', 'createdAt', 'updatedAt', 'isArchived', 'archivedAt'];

    const allKeys = new Set([...Object.keys(prev), ...Object.keys(curr)]);

    allKeys.forEach(key => {
      if (ignoreFields.includes(key)) return;
      
      const pVal = prev[key];
      const cVal = curr[key];

      // Deep stringify comparison for simple objects/arrays
      if (JSON.stringify(pVal) !== JSON.stringify(cVal)) {
        diffPrev[key] = pVal;
        diffCurr[key] = cVal;
        hasChanges = true;
      }
    });

    return hasChanges ? { prev: diffPrev, curr: diffCurr } : null;
  }

  public async log(params: LogParams): Promise<void> {
    const userStr = localStorage.getItem('corestack_session');
    let userId = 'SYSTEM';
    let userName = 'System';
    let userRole = 'System';
    
    if (userStr) {
      try {
        const session = JSON.parse(userStr);
        if (session.user) {
          userId = session.user.id || 'SYSTEM';
          userName = `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || 'Admin';
          userRole = session.user.roleName || session.user.role || 'User';
        }
      } catch (e) {
        // ignore
      }
    }

    let pVal = params.previousValue;
    let nVal = params.newValue;

    // Smart differential extraction for Updates
    if (params.action === 'Update' && pVal && nVal) {
      const diff = this.extractChanges(pVal, nVal);
      if (diff) {
        pVal = diff.prev;
        nVal = diff.curr;
      }
    }

    // Default severity fallback mapping if not provided
    let severity = params.severity;
    if (!severity) {
      if (params.action.includes('Delete') || params.action.includes('Reject') || params.action === 'Settings Changed') {
        severity = 'Warning';
      } else if (params.action.includes('Create') || params.action === 'Complete' || params.action.includes('Approve')) {
        severity = 'Success';
      } else {
        severity = 'Info';
      }
    }

    // Use super.create internally
    await super.create({
      userId,
      userName,
      userRole,
      action: params.action,
      module: params.module,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      description: params.description,
      previousValue: pVal,
      newValue: nVal,
      ipAddress: '192.168.1.104', // UI Ready simulated
      device: navigator.userAgent.substring(0, 50) + '...', // UI Ready simulated
      severity: severity,
      metadata: params.metadata
    });
  }

  // Immutability Rules
  public async update(): Promise<AuditLog> { throw new Error('Audit logs are immutable.'); }
  public async archive(): Promise<AuditLog> { throw new Error('Audit logs cannot be archived.'); }
  public async restore(): Promise<AuditLog> { throw new Error('Audit logs cannot be restored.'); }

  public async getStatistics() {
    await this.delay(100);
    const all = this.readData();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayCount = 0;
    let userActions = 0;
    let systemActions = 0;
    let securityEvents = 0;

    all.forEach(log => {
      const logDate = new Date(log.createdAt);
      if (logDate >= today) todayCount++;
      if (log.userId === 'SYSTEM') systemActions++;
      else userActions++;
      
      if (log.module === 'Authentication' || log.module === 'Settings' || log.severity === 'Critical') {
        securityEvents++;
      }
    });

    return {
      total: all.length,
      today: todayCount,
      userActions,
      systemActions,
      securityEvents
    };
  }
}

export const activityLogService = new ActivityLogService();
