import { StorageService } from './StorageService';
import { Employee, EmployeeStats } from '@/types/employee';
import { activityLogService } from './ActivityLogService';

class EmployeeService extends StorageService<Employee> {
  constructor() {
    super('employees');
  }

  public async create(item: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'>): Promise<Employee> {
    await this.delay();
    const all = this.readData();

    item.employeeId = item.employeeId.toUpperCase().trim();
    item.email = item.email.toLowerCase().trim();
    item.mobile = item.mobile.trim();

    // Business Rules
    const isEmpIdDuplicate = all.some(e => e.employeeId === item.employeeId && !e.isArchived);
    const isEmailDuplicate = all.some(e => e.email === item.email && !e.isArchived);
    const isPhoneDuplicate = all.some(e => e.mobile === item.mobile && !e.isArchived);

    if (isEmpIdDuplicate) throw new Error(`Employee ID "${item.employeeId}" is already taken.`);
    if (isEmailDuplicate) throw new Error(`Email "${item.email}" is already registered.`);
    if (isPhoneDuplicate) throw new Error(`Mobile number "${item.mobile}" is already registered.`);

    // Department Check
    if (item.departmentId) {
      const depts = localStorage.getItem('departments') ? JSON.parse(localStorage.getItem('departments')!) : [];
      const dept = depts.find((d: any) => d.id === item.departmentId);
      if (dept && (dept.isArchived || dept.status === 'INACTIVE')) {
        throw new Error('Cannot assign to an inactive or archived department.');
      }
    }

    const created = await super.create(item);
    
    await activityLogService.log({
      action: 'Create',
      module: 'Employees',
      entityType: 'Employee',
      entityId: created.id,
      entityName: `${created.firstName} ${created.lastName}`,
      description: `Created employee ${created.firstName} ${created.lastName} (${created.employeeId})`
    });

    return created;
  }

  public async update(id: string, updates: Partial<Employee>): Promise<Employee> {
    await this.delay();
    const all = this.readData();
    const existing = all.find(e => e.id === id);
    if (!existing) throw new Error('Employee not found');

    if (updates.employeeId) {
      updates.employeeId = updates.employeeId.toUpperCase().trim();
      if (all.some(e => e.id !== id && e.employeeId === updates.employeeId! && !e.isArchived)) {
        throw new Error(`Employee ID "${updates.employeeId}" is already taken.`);
      }
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
      if (all.some(e => e.id !== id && e.email === updates.email! && !e.isArchived)) {
        throw new Error(`Email "${updates.email}" is already registered.`);
      }
    }

    if (updates.mobile) {
      updates.mobile = updates.mobile.trim();
      if (all.some(e => e.id !== id && e.mobile === updates.mobile! && !e.isArchived)) {
        throw new Error(`Mobile number "${updates.mobile}" is already registered.`);
      }
    }

    if (updates.departmentId) {
      const depts = localStorage.getItem('departments') ? JSON.parse(localStorage.getItem('departments')!) : [];
      const dept = depts.find((d: any) => d.id === updates.departmentId);
      if (dept && (dept.isArchived || dept.status === 'INACTIVE')) {
        throw new Error('Cannot assign to an inactive or archived department.');
      }
    }

    const updated = await super.update(id, updates);

    await activityLogService.log({
      action: 'Update',
      module: 'Employees',
      entityType: 'Employee',
      entityId: updated.id,
      entityName: `${updated.firstName} ${updated.lastName}`,
      description: `Updated profile for ${updated.firstName} ${updated.lastName}`,
      previousValue: existing,
      newValue: updated
    });

    return updated;
  }

  public async archive(id: string): Promise<Employee> {
    const archived = await super.archive(id);
    await activityLogService.log({
      action: 'Archive',
      module: 'Employees',
      entityType: 'Employee',
      entityId: archived.id,
      entityName: `${archived.firstName} ${archived.lastName}`,
      description: `Archived employee ${archived.firstName} ${archived.lastName}`,
      previousValue: { status: 'Active' },
      newValue: { status: 'Archived' }
    });
    return archived;
  }

  public async restore(id: string): Promise<Employee> {
    const restored = await super.restore(id);
    await activityLogService.log({
      action: 'Restore',
      module: 'Employees',
      entityType: 'Employee',
      entityId: restored.id,
      entityName: `${restored.firstName} ${restored.lastName}`,
      description: `Restored employee ${restored.firstName} ${restored.lastName}`,
      previousValue: { status: 'Archived' },
      newValue: { status: 'Active' }
    });
    return restored;
  }

  public async getStats(): Promise<EmployeeStats> {
    await this.delay(100);
    const all = this.readData();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    return {
      total: all.length,
      active: all.filter(e => !e.isArchived && e.status === 'ACTIVE').length,
      inactive: all.filter(e => !e.isArchived && (e.status === 'INACTIVE' || e.status === 'PENDING')).length,
      archived: all.filter(e => e.isArchived).length,
      newThisMonth: all.filter(e => !e.isArchived && e.joiningDate >= startOfMonth).length,
    };
  }
}

export const employeeService = new EmployeeService();
