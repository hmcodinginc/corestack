export interface FirmProfile {
  firmName: string;
  firmLogo: string | null; // base64 or URL
  registrationNumber: string;
  firmType: string;
  pan: string;
  gstin: string;
  professionalTaxNumber: string;
  email: string;
  phone: string;
  alternatePhone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  description: string;
  establishedDate: string;
}

export interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  sidebarCollapsed: boolean;
}

export interface GeneralSettings {
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  financialYear: string;
  defaultCountry: string;
  defaultState: string;
  defaultPaginationSize: number;
  firstDayOfWeek: string;
}

export interface SecuritySettings {
  sessionTimeout: number; // minutes
  autoLogout: boolean;
  loginActivityLogging: boolean;
  twoFactorAuthEnabled: boolean; // UI only
  securityNotifications: boolean;
}

export interface BillingSettings {
  defaultCurrency: string;
  defaultTaxRate: number;
  invoicePrefix: string;
  invoiceNumberFormat: string;
  invoiceDueDays: number;
  paymentTerms: string;
  invoiceFooter: string;
  bankDetails: string;
  upiId: string;
  paymentInstructions: string;
}

export interface DocumentSettings {
  defaultDocumentCategories: string[];
  maxFileSizeMB: number;
  allowedFileTypes: string[];
  documentNamingPattern: string;
  defaultDocumentVisibility: 'public' | 'private' | 'role_based';
  versioningEnabled: boolean;
  documentExpiryReminder: boolean;
  defaultExpiryReminderDays: number;
}

export interface TaskWorkflowSettings {
  defaultTaskPriority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  defaultTaskStatus: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS';
  defaultDueDays: number; // 0 = no default
  taskAutoAssignment: boolean;
  allowMultipleAssignees: boolean;
  requireChecklist: boolean;
  requireTaskApproval: boolean;
  overdueTaskReminder: boolean;
  taskCompletionRules: string;
}

export interface AppSettings {
  firmProfile: FirmProfile;
  appearance: AppearanceSettings;
  general: GeneralSettings;
  security: SecuritySettings;
  billing: BillingSettings;
  documents: DocumentSettings;
  tasks: TaskWorkflowSettings;
}
