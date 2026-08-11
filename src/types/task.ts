import { ArchiveEntity } from './index';

export type TaskStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskCategory = 'GST Return' | 'Income Tax Return' | 'Audit' | 'Bookkeeping' | 'ROC Filing' | 'TDS' | 'Payroll' | 'Compliance' | 'Consultation' | 'Custom Category' | string;

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface AppTask extends ArchiveEntity {
  taskCode: string; // Auto-generated
  taskName: string;
  clientId: string;
  departmentId?: string;
  managerId?: string;
  employeeIds: string[]; // Multiple assigned employees
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  
  description?: string;
  instructions?: string;
  
  startDate?: string;
  dueDate?: string;
  completionDate?: string;
  
  estimatedHours?: number;
  actualHours?: number;
  
  tags: string[];
  notes?: string;

  checklist: ChecklistItem[];

  // Computed
  clientName?: string;
  managerName?: string;
  departmentName?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  highPriority: number;
  dueToday: number;
}
