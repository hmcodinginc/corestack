import { AppSettings } from '@/types';
import { activityLogService } from './ActivityLogService';

const SETTINGS_KEY = 'corestack_settings';

const DEFAULT_SETTINGS: AppSettings = {
  firmProfile: {
    firmName: 'CoreStack Solutions',
    firmLogo: null,
    registrationNumber: 'REG-123456',
    firmType: 'Partnership',
    pan: 'ABCDE1234F',
    gstin: '27ABCDE1234F1Z5',
    professionalTaxNumber: '',
    email: 'contact@corestack.com',
    phone: '+91 9876543210',
    alternatePhone: '',
    website: 'https://corestack.com',
    address: '123 Business Park, Tech Boulevard',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    description: 'A leading CA firm providing comprehensive financial solutions.',
    establishedDate: '2023-01-01',
  },
  appearance: {
    primaryColor: '#2563eb', // Blue-600
    secondaryColor: '#4f46e5', // Indigo-600
    theme: 'light',
    density: 'comfortable',
    sidebarCollapsed: false,
  },
  general: {
    defaultLanguage: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    currency: 'INR',
    financialYear: 'April-March',
    defaultCountry: 'India',
    defaultState: 'Maharashtra',
    defaultPaginationSize: 10,
    firstDayOfWeek: 'Monday',
  },
  security: {
    sessionTimeout: 60,
    autoLogout: true,
    loginActivityLogging: true,
    twoFactorAuthEnabled: false,
    securityNotifications: true,
  },
  billing: {
    defaultCurrency: 'INR',
    defaultTaxRate: 18,
    invoicePrefix: 'INV',
    invoiceNumberFormat: '{PREFIX}-{YYYY}-{XXXX}',
    invoiceDueDays: 15,
    paymentTerms: 'Payment due within 15 days of invoice date. Late payment subject to 1.5% interest per month.',
    invoiceFooter: 'Thank you for your business.',
    bankDetails: 'Bank: HDFC\nA/c Name: CoreStack Solutions\nA/c No: 50200000000000\nIFSC: HDFC0000001',
    upiId: 'corestack@hdfcbank',
    paymentInstructions: 'Please quote the invoice number in your transfer reference.',
  },
  documents: {
    defaultDocumentCategories: ['Tax Returns', 'Audit Reports', 'Financial Statements', 'Client KYC', 'Working Papers'],
    maxFileSizeMB: 25,
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png'],
    documentNamingPattern: '{CLIENT_CODE}_{DOC_TYPE}_{YYYY}',
    defaultDocumentVisibility: 'role_based',
    versioningEnabled: true,
    documentExpiryReminder: true,
    defaultExpiryReminderDays: 30,
  },
  tasks: {
    defaultTaskPriority: 'NORMAL',
    defaultTaskStatus: 'PENDING',
    defaultDueDays: 7,
    taskAutoAssignment: false,
    allowMultipleAssignees: true,
    requireChecklist: false,
    requireTaskApproval: true,
    overdueTaskReminder: true,
    taskCompletionRules: 'All checklist items must be completed before marking task as done.',
  }
};

class SettingsService {
  private getStorage(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  }

  private setStorage(settings: AppSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // Dispatch event so UI can update immediately (e.g. Navbar firm name, theme)
    window.dispatchEvent(new CustomEvent('corestack:settings_updated'));
  }

  public getSettings(): AppSettings {
    return this.getStorage();
  }

  public async updateSettings<K extends keyof AppSettings>(section: K, data: AppSettings[K]): Promise<void> {
    const current = this.getStorage();
    current[section] = data;
    this.setStorage(current);

    await activityLogService.log({
      action: 'Settings Changed',
      module: 'Settings',
      entityType: 'Settings',
      entityId: `settings_${section}`,
      entityName: `${section} Settings`,
      description: `Updated ${section} configuration settings`
    });
  }
}

export const settingsService = new SettingsService();
