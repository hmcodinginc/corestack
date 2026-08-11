import { StorageService } from './StorageService';
import { Department, DepartmentStats } from '@/types/department';
import { activityLogService } from './ActivityLogService';

class DepartmentService extends StorageService<Department> {
  constructor() {
    super('departments');
  }

  public async getAll(includeArchived: boolean = false): Promise<Department[]> {
    const departments = await super.getAll(includeArchived);
    const employees = localStorage.getItem('employees') ? JSON.parse(localStorage.getItem('employees')!) : [];
    
    return departments.map(dept => {
      const activeEmployees = employees.filter((e: any) => e.departmentId === dept.id && !e.isArchived && e.status === 'ACTIVE');
      const allEmployees = employees.filter((e: any) => e.departmentId === dept.id && !e.isArchived);
      return {
        ...dept,
        employeeCount: allEmployees.length,
        activeEmployeeCount: activeEmployees.length
      };
    });
  }

  public async getById(id: string): Promise<Department | null> {
    const dept = await super.getById(id);
    if (!dept) return null;
    
    const employees = localStorage.getItem('employees') ? JSON.parse(localStorage.getItem('employees')!) : [];
    const activeEmployees = employees.filter((e: any) => e.departmentId === dept.id && !e.isArchived && e.status === 'ACTIVE');
    const allEmployees = employees.filter((e: any) => e.departmentId === dept.id && !e.isArchived);
    
    return {
      ...dept,
      employeeCount: allEmployees.length,
      activeEmployeeCount: activeEmployees.length
    };
  }

  // Override create to include business rules and activity logging
  public async create(item: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'>): Promise<Department> {
    await this.delay();
    const all = this.readData();

    // Business Rule: Name and Code must be unique
    const isNameDuplicate = all.some(d => d.name.toLowerCase().trim() === item.name.toLowerCase().trim() && !d.isArchived);
    const isCodeDuplicate = all.some(d => d.code.toUpperCase().trim() === item.code.toUpperCase().trim() && !d.isArchived);

    if (isNameDuplicate) throw new Error(`A department with the name "${item.name}" already exists.`);
    if (isCodeDuplicate) throw new Error(`A department with the code "${item.code}" already exists.`);

    item.name = item.name.trim();
    item.code = item.code.toUpperCase().trim();

    const created = await super.create(item);
    
    await activityLogService.log({
      action: 'Create',
      module: 'Departments',
      entityType: 'Department',
      entityId: created.id,
      entityName: created.name,
      description: `Created department ${created.name} (${created.code})`
    });

    return created;
  }

  // Override update to include business rules and activity logging
  public async update(id: string, updates: Partial<Department>): Promise<Department> {
    await this.delay();
    const all = this.readData();
    const existing = all.find(d => d.id === id);
    if (!existing) throw new Error('Department not found');

    if (updates.name) {
      updates.name = updates.name.trim();
      const isNameDuplicate = all.some(d => d.id !== id && d.name.toLowerCase() === updates.name!.toLowerCase() && !d.isArchived);
      if (isNameDuplicate) throw new Error(`A department with the name "${updates.name}" already exists.`);
    }

    if (updates.code) {
      updates.code = updates.code.toUpperCase().trim();
      const isCodeDuplicate = all.some(d => d.id !== id && d.code.toUpperCase() === updates.code!.toUpperCase() && !d.isArchived);
      if (isCodeDuplicate) throw new Error(`A department with the code "${updates.code}" already exists.`);
    }

    const updated = await super.update(id, updates);

    await activityLogService.log({
      action: 'Update',
      module: 'Departments',
      entityType: 'Department',
      entityId: updated.id,
      entityName: updated.name,
      description: `Updated department ${updated.name}`,
      previousValue: existing,
      newValue: updated
    });

    return updated;
  }

  // Override archive to enforce constraints
  public async archive(id: string): Promise<Department> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Department not found');

    // Business Rule: Cannot archive if active employees exist (Mocked logic for now, should check Employee table)
    const employees = localStorage.getItem('employees') ? JSON.parse(localStorage.getItem('employees')!) : [];
    const activeEmployeesInDept = employees.filter((e: any) => e.departmentId === id && !e.isArchived);
    
    if (activeEmployeesInDept.length > 0) {
      throw new Error(`Cannot archive department. There are ${activeEmployeesInDept.length} active employees assigned.`);
    }

    const archived = await super.archive(id);

    await activityLogService.log({
      action: 'Archive',
      module: 'Departments',
      entityType: 'Department',
      entityId: archived.id,
      entityName: archived.name,
      description: `Archived department ${archived.name}`,
      previousValue: { status: 'Active' },
      newValue: { status: 'Archived' }
    });

    return archived;
  }

  public async restore(id: string): Promise<Department> {
    const restored = await super.restore(id);
    await activityLogService.log({
      action: 'Restore',
      module: 'Departments',
      entityType: 'Department',
      entityId: restored.id,
      entityName: restored.name,
      description: `Restored department ${restored.name}`,
      previousValue: { status: 'Archived' },
      newValue: { status: 'Active' }
    });
    return restored;
  }

  public async getStats(): Promise<DepartmentStats> {
    await this.delay(100);
    const all = this.readData();
    return {
      total: all.length,
      active: all.filter(d => !d.isArchived && d.status === 'ACTIVE').length,
      archived: all.filter(d => d.isArchived).length,
    };
  }
}

export const departmentService = new DepartmentService();
