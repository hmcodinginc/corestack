import { activityLogService } from './ActivityLogService';
import { notificationService } from './NotificationService';

// The strict registry of data keys owned by CoreStack.
export const CORESTACK_DATA_KEYS = [
  'departments',
  'roles',
  'designations',
  'employees',
  'clients',
  'documents',
  'tasks',
  'invoices',
  'payments',
  'corestack_notifications',
  'corestack_notification_preferences',
  'corestack_notification_templates',
  'corestack_reminders',
  'corestack_communication_logs',
  'corestack_settings',
  'activity_logs',
  'users'
];

export interface ImportResult {
  success: boolean;
  message: string;
  recordsRestored: number;
}

class DataManagementService {
  
  /**
   * Generates a JSON string of all registered CoreStack data.
   */
  public async exportAllData(): Promise<string> {
    const exportData: Record<string, any> = {};
    
    for (const key of CORESTACK_DATA_KEYS) {
      const data = localStorage.getItem(key);
      if (data) {
        exportData[key] = JSON.parse(data);
      }
    }

    await activityLogService.log({
      action: 'Export',
      module: 'System',
      entityType: 'System Data',
      entityId: 'data_export',
      entityName: 'System Data',
      description: 'Exported all CoreStack data to JSON'
    });
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Safely imports data. Validates JSON, backs up current state in memory,
   * overwrites ONLY registered keys, and triggers UI refresh.
   */
  public async importData(jsonString: string): Promise<ImportResult> {
    let parsedData: Record<string, any>;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      return { success: false, message: 'Invalid JSON format. Upload failed.', recordsRestored: 0 };
    }

    // Validate that it contains at least some corestack keys
    const incomingKeys = Object.keys(parsedData);
    const validKeys = incomingKeys.filter(k => CORESTACK_DATA_KEYS.includes(k));
    
    if (validKeys.length === 0) {
      return { success: false, message: 'JSON does not contain any valid CoreStack data keys.', recordsRestored: 0 };
    }

    // Create in-memory backup of current keys
    const backup: Record<string, string | null> = {};
    for (const key of CORESTACK_DATA_KEYS) {
      backup[key] = localStorage.getItem(key);
    }

    try {
      let recordsCount = 0;
      
      // Replace registered data
      for (const key of validKeys) {
        const val = parsedData[key];
        if (Array.isArray(val)) {
          recordsCount += val.length;
        } else if (typeof val === 'object') {
          recordsCount += 1; // e.g. settings object
        }
        localStorage.setItem(key, JSON.stringify(val));
      }

      await activityLogService.log({
        action: 'Import',
        module: 'System',
        entityType: 'System Data',
        entityId: 'data_import',
        entityName: 'System Data',
        description: `Restored ${recordsCount} records from JSON backup`
      });
      
      // Dispatch global event for full app reload (simulating a hard refresh without actually doing window.location.reload to keep it SPA)
      window.dispatchEvent(new CustomEvent('corestack:data_refresh'));
      
      return { success: true, message: 'Data imported successfully.', recordsRestored: recordsCount };

    } catch (error) {
      // Restore backup if something went completely wrong
      for (const key of CORESTACK_DATA_KEYS) {
        if (backup[key] === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, backup[key] as string);
        }
      }
      return { success: false, message: 'Import failed during write. Restored from backup.', recordsRestored: 0 };
    }
  }

  /**
   * Strictly clears ONLY registered keys. Does not touch unrelated browser storage.
   */
  public async clearDemoData(): Promise<void> {
    for (const key of CORESTACK_DATA_KEYS) {
      localStorage.removeItem(key);
    }
    
    // Create one log to exist in the fresh slate
    await activityLogService.log({
      action: 'Delete',
      module: 'System',
      entityType: 'System Data',
      entityId: 'data_clear',
      entityName: 'System Data',
      description: 'Cleared all demo data. Fresh slate started.'
    });
    
    window.dispatchEvent(new CustomEvent('corestack:data_refresh'));
  }

  public getStorageStats() {
    let totalBytes = 0;
    const counts: Record<string, number> = {};

    for (const key of CORESTACK_DATA_KEYS) {
      const dataStr = localStorage.getItem(key);
      if (dataStr) {
        totalBytes += dataStr.length * 2; // Approximate byte size (UTF-16)
        
        try {
          const parsed = JSON.parse(dataStr);
          counts[key.replace('corestack_', '')] = Array.isArray(parsed) ? parsed.length : 1;
        } catch {
          counts[key.replace('corestack_', '')] = 0;
        }
      } else {
        counts[key.replace('corestack_', '')] = 0;
      }
    }

    return {
      totalBytes,
      counts,
      formattedSize: (totalBytes / 1024).toFixed(2) + ' KB'
    };
  }
}

export const dataManagementService = new DataManagementService();
