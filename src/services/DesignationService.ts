import { StorageService } from './StorageService';
import { Designation, DesignationStats } from '@/types/designation';
import { activityLogService } from './ActivityLogService';

class DesignationService extends StorageService<Designation> {
  constructor() {
    super('designations');
  }

  public async create(item: Omit<Designation, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'>): Promise<Designation> {
    await this.delay();
    const all = this.readData();

    item.name = item.name.trim();
    item.code = item.code.toUpperCase().trim();

    // Business Rule: Name and Code must be unique
    const isNameDuplicate = all.some(d => d.name.toLowerCase() === item.name.toLowerCase() && !d.isArchived);
    const isCodeDuplicate = all.some(d => d.code === item.code && !d.isArchived);

    if (isNameDuplicate) throw new Error(`A designation with the name "${item.name}" already exists.`);
    if (isCodeDuplicate) throw new Error(`A designation with the code "${item.code}" already exists.`);

    const created = await super.create(item);
    
    await activityLogService.log({
      action: 'Create',
      module: 'Designations',
      entityType: 'Designation',
      entityId: created.id,
      entityName: created.name,
      description: `Created designation ${created.name} (${created.code})`
    });

    return created;
  }

  public async update(id: string, updates: Partial<Designation>): Promise<Designation> {
    await this.delay();
    const all = this.readData();
    const existing = all.find(d => d.id === id);
    if (!existing) throw new Error('Designation not found');

    if (updates.name) {
      updates.name = updates.name.trim();
      const isNameDuplicate = all.some(d => d.id !== id && d.name.toLowerCase() === updates.name!.toLowerCase() && !d.isArchived);
      if (isNameDuplicate) throw new Error(`A designation with the name "${updates.name}" already exists.`);
    }

    if (updates.code) {
      updates.code = updates.code.toUpperCase().trim();
      const isCodeDuplicate = all.some(d => d.id !== id && d.code === updates.code! && !d.isArchived);
      if (isCodeDuplicate) throw new Error(`A designation with the code "${updates.code}" already exists.`);
    }

    const updated = await super.update(id, updates);

    await activityLogService.log({
      action: 'Update',
      module: 'Designations',
      entityType: 'Designation',
      entityId: updated.id,
      entityName: updated.name,
      description: `Updated designation ${updated.name}`,
      previousValue: existing,
      newValue: updated
    });

    return updated;
  }

  public async archive(id: string): Promise<Designation> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Designation not found');

    // Business Rule: Cannot archive if employees exist
    const employees = localStorage.getItem('employees') ? JSON.parse(localStorage.getItem('employees')!) : [];
    const activeEmployeesWithDesignation = employees.filter((e: any) => e.designationId === id && !e.isArchived);
    
    if (activeEmployeesWithDesignation.length > 0) {
      throw new Error(`Cannot archive designation. There are ${activeEmployeesWithDesignation.length} active employees assigned.`);
    }

    const archived = await super.archive(id);

    await activityLogService.log({
      action: 'Archive',
      module: 'Designations',
      entityType: 'Designation',
      entityId: archived.id,
      entityName: archived.name,
      description: `Archived designation ${archived.name}`,
      previousValue: { status: 'Active' },
      newValue: { status: 'Archived' }
    });

    return archived;
  }

  public async restore(id: string): Promise<Designation> {
    const restored = await super.restore(id);
    await activityLogService.log({
      action: 'Restore',
      module: 'Designations',
      entityType: 'Designation',
      entityId: restored.id,
      entityName: restored.name,
      description: `Restored designation ${restored.name}`,
      previousValue: { status: 'Archived' },
      newValue: { status: 'Active' }
    });
    return restored;
  }

  public async getStats(): Promise<DesignationStats> {
    await this.delay(100);
    const all = this.readData();
    return {
      total: all.length,
      active: all.filter(d => !d.isArchived && d.status === 'ACTIVE').length,
      archived: all.filter(d => d.isArchived).length,
    };
  }
}

export const designationService = new DesignationService();
