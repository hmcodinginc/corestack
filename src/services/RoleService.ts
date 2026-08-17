import { StorageService } from './StorageService';
import { Role, RoleStats } from '@/types/role';
import { activityLogService } from './ActivityLogService';

class RoleService extends StorageService<Role> {
  constructor() {
    super('roles');
  }

  // Override create to include business rules and activity logging
  public async create(item: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'>): Promise<Role> {
    await this.delay();
    const all = this.readData();

    item.name = item.name.trim();
    item.code = item.code.toUpperCase().trim();

    // Business Rule: Name and Code must be unique
    const isNameDuplicate = all.some(r => r.name.toLowerCase() === item.name.toLowerCase() && !r.isArchived);
    const isCodeDuplicate = all.some(r => r.code === item.code && !r.isArchived);

    if (isNameDuplicate) throw new Error(`A role with the name "${item.name}" already exists.`);
    if (isCodeDuplicate) throw new Error(`A role with the code "${item.code}" already exists.`);

    const created = await super.create(item);
    
    await activityLogService.log({
      action: 'Create',
      module: 'Roles',
      entityType: 'Role',
      entityId: created.id,
      entityName: created.name,
      description: `Created role ${created.name} (${created.code})`
    });

    return created;
  }

  // Override update to include business rules and activity logging
  public async update(id: string, updates: Partial<Role>): Promise<Role> {
    await this.delay();
    const all = this.readData();
    const existing = all.find(r => r.id === id);
    if (!existing) throw new Error('Role not found');

    if (updates.name) {
      updates.name = updates.name.trim();
      const isNameDuplicate = all.some(r => r.id !== id && r.name.toLowerCase() === updates.name!.toLowerCase() && !r.isArchived);
      if (isNameDuplicate) throw new Error(`A role with the name "${updates.name}" already exists.`);
    }

    if (updates.code) {
      updates.code = updates.code.toUpperCase().trim();
      const isCodeDuplicate = all.some(r => r.id !== id && r.code === updates.code! && !r.isArchived);
      if (isCodeDuplicate) throw new Error(`A role with the code "${updates.code}" already exists.`);
    }

    const updated = await super.update(id, updates);

    await activityLogService.log({
      action: 'Update',
      module: 'Roles',
      entityType: 'Role',
      entityId: updated.id,
      entityName: updated.name,
      description: `Updated role ${updated.name}`,
      previousValue: existing,
      newValue: updated
    });

    if (updates.permissions) {
      await activityLogService.log({
        action: 'Update',
        module: 'Roles',
        entityType: 'Role',
        entityId: updated.id,
        entityName: updated.name,
        description: `Permissions updated for role ${updated.name}`
      });
    }

    return updated;
  }

  // Override archive to enforce constraints
  public async archive(id: string): Promise<Role> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Role not found');

    // Business Rule: Owner cannot be archived
    if (existing.hierarchyLevel === 1 || existing.code === 'OWNER' || existing.name === 'Owner') {
      throw new Error('The Owner role cannot be archived.');
    }

    // Business Rule: Cannot archive if employees exist
    const employees = localStorage.getItem('employees') ? JSON.parse(localStorage.getItem('employees')!) : [];
    const activeEmployeesWithRole = employees.filter((e: any) => e.roleId === id && !e.isArchived);
    
    if (activeEmployeesWithRole.length > 0) {
      throw new Error(`Cannot archive role. There are ${activeEmployeesWithRole.length} active employees assigned.`);
    }

    const archived = await super.archive(id);

    await activityLogService.log({
      action: 'Archive',
      module: 'Roles',
      entityType: 'Role',
      entityId: archived.id,
      entityName: archived.name,
      description: `Archived role ${archived.name}`,
      previousValue: { status: 'Active' },
      newValue: { status: 'Archived' }
    });

    return archived;
  }

  public async restore(id: string): Promise<Role> {
    const restored = await super.restore(id);
    await activityLogService.log({
      action: 'Restore',
      module: 'Roles',
      entityType: 'Role',
      entityId: restored.id,
      entityName: restored.name,
      description: `Restored role ${restored.name}`,
      previousValue: { status: 'Archived' },
      newValue: { status: 'Active' }
    });
    return restored;
  }

  public async getStats(): Promise<RoleStats> {
    await this.delay(100);
    const all = this.readData();
    return {
      total: all.length,
      active: all.filter(r => !r.isArchived && r.status === 'ACTIVE').length,
      archived: all.filter(r => r.isArchived).length,
    };
  }
}

export const roleService = new RoleService();
