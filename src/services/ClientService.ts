import { StorageService } from './StorageService';
import { Client, ClientStats } from '@/types/client';
import { activityLogService } from './ActivityLogService';
import { notificationService } from './NotificationService';

class ClientService extends StorageService<Client> {
  constructor() {
    super('clients');
  }

  public async create(item: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'>): Promise<Client> {
    await this.delay();
    const all = this.readData();

    item.clientCode = item.clientCode.toUpperCase().trim();
    item.pan = item.pan.toUpperCase().trim();
    if (item.email) item.email = item.email.toLowerCase().trim();
    if (item.gst) item.gst = item.gst.toUpperCase().trim();

    // Business Rules
    const isCodeDuplicate = all.some(c => c.clientCode === item.clientCode && !c.isArchived);
    const isPanDuplicate = all.some(c => c.pan === item.pan && !c.isArchived);
    const isGstDuplicate = item.gst && all.some(c => c.gst === item.gst && !c.isArchived);
    const isEmailDuplicate = item.email && all.some(c => c.email === item.email && !c.isArchived);
    const isAadhaarDuplicate = item.aadhaar && all.some(c => c.aadhaar === item.aadhaar && !c.isArchived);
    const isMobileDuplicate = all.some(c => c.mobile === item.mobile && !c.isArchived);

    if (isCodeDuplicate) throw new Error(`Client Code "${item.clientCode}" is already in use.`);
    if (isPanDuplicate) throw new Error(`PAN "${item.pan}" is already registered.`);
    if (isGstDuplicate) throw new Error(`GST "${item.gst}" is already registered.`);
    if (isEmailDuplicate) throw new Error(`Email "${item.email}" is already registered.`);
    if (isAadhaarDuplicate) throw new Error(`Aadhaar "${item.aadhaar}" is already registered.`);
    if (isMobileDuplicate) throw new Error(`Mobile "${item.mobile}" is already registered.`);

    const created = await super.create(item);
    
    await activityLogService.log({
      action: 'Create',
      module: 'Clients',
      entityType: 'Client',
      entityId: created.id,
      entityName: created.clientName,
      description: `Created client ${created.clientName} (${created.clientCode})`
    });

    if (created.managerId || created.employeeIds.length > 0) {
       await activityLogService.log({ action: 'Update', module: 'Clients', entityType: 'Client', entityId: created.id, entityName: created.clientName, description: `Assigned initial team to ${created.clientName}` });
    }

    if (created.managerId) {
       await notificationService.createNotification(
         `New Client Assigned: ${created.clientName}`,
         `You have been assigned as the manager for a new ${created.clientType} client.`,
         'Client Assigned',
         'NORMAL',
         created.managerId,
         'CLIENTS',
         created.id,
         `/clients/${created.id}`
       );
    }

    return created;
  }

  public async update(id: string, updates: Partial<Client>): Promise<Client> {
    await this.delay();
    const all = this.readData();
    const existing = all.find(c => c.id === id);
    if (!existing) throw new Error('Client not found');

    if (updates.clientCode) {
      updates.clientCode = updates.clientCode.toUpperCase().trim();
      if (all.some(c => c.id !== id && c.clientCode === updates.clientCode! && !c.isArchived)) {
        throw new Error(`Client Code "${updates.clientCode}" is already taken.`);
      }
    }

    if (updates.pan) {
      updates.pan = updates.pan.toUpperCase().trim();
      if (all.some(c => c.id !== id && c.pan === updates.pan! && !c.isArchived)) {
        throw new Error(`PAN "${updates.pan}" is already registered.`);
      }
    }

    if (updates.gst) {
      updates.gst = updates.gst.toUpperCase().trim();
      if (all.some(c => c.id !== id && c.gst === updates.gst! && !c.isArchived)) {
        throw new Error(`GST "${updates.gst}" is already registered.`);
      }
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
      if (all.some(c => c.id !== id && c.email === updates.email! && !c.isArchived)) {
        throw new Error(`Email "${updates.email}" is already registered.`);
      }
    }

    if (updates.aadhaar) {
      if (all.some(c => c.id !== id && c.aadhaar === updates.aadhaar! && !c.isArchived)) {
        throw new Error(`Aadhaar "${updates.aadhaar}" is already registered.`);
      }
    }

    if (updates.mobile) {
      if (all.some(c => c.id !== id && c.mobile === updates.mobile! && !c.isArchived)) {
        throw new Error(`Mobile "${updates.mobile}" is already registered.`);
      }
    }

    const teamChanged = 
       (updates.managerId !== undefined && updates.managerId !== existing.managerId) ||
       (updates.employeeIds !== undefined && JSON.stringify(updates.employeeIds) !== JSON.stringify(existing.employeeIds));

    const updated = await super.update(id, updates);

    await activityLogService.log({
      action: 'Update',
      module: 'Clients',
      entityType: 'Client',
      entityId: updated.id,
      entityName: updated.clientName,
      description: `Updated profile for ${updated.clientName}`,
      previousValue: existing,
      newValue: updated
    });

    if (teamChanged) {
       await activityLogService.log({
         action: 'Update',
         module: 'Clients',
         entityType: 'Client',
         entityId: updated.id,
         entityName: updated.clientName,
         description: `Reassigned team for ${updated.clientName}`
       });

       // Notify new manager if changed
       if (updates.managerId && updates.managerId !== existing.managerId) {
         await notificationService.createNotification(
           `Client Reassigned: ${updated.clientName}`,
           `You have been assigned as the manager for ${updated.clientName}.`,
           'Client Assigned',
           'HIGH',
           updates.managerId,
           'CLIENTS',
           updated.id,
           `/workspace/clients/${updated.id}`
         );
       }

       // Notify new employees
       if (updates.employeeIds) {
         const newEmployees = updates.employeeIds.filter(id => !(existing.employeeIds || []).includes(id));
         for (const empId of newEmployees) {
           await notificationService.createNotification(
             `Added to Client Team: ${updated.clientName}`,
             `You have been added to the team for ${updated.clientName}.`,
             'Client Assigned',
             'NORMAL',
             empId,
             'CLIENTS',
             updated.id,
             `/workspace/clients/${updated.id}`
           );
         }
       }
    }

    return updated;
  }

  public async archive(id: string): Promise<Client> {
    const archived = await super.archive(id);
    await activityLogService.log({
      action: 'Archive',
      module: 'Clients',
      entityType: 'Client',
      entityId: archived.id,
      entityName: archived.clientName,
      description: `Archived client ${archived.clientName}`,
      previousValue: { status: 'Active' },
      newValue: { status: 'Archived' }
    });
    return archived;
  }

  public async restore(id: string): Promise<Client> {
    const restored = await super.restore(id);
    await activityLogService.log({
      action: 'Restore',
      module: 'Clients',
      entityType: 'Client',
      entityId: restored.id,
      entityName: restored.clientName,
      description: `Restored client ${restored.clientName}`,
      previousValue: { status: 'Archived' },
      newValue: { status: 'Active' }
    });
    return restored;
  }

  public async getStats(): Promise<ClientStats> {
    await this.delay(100);
    const all = this.readData();
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();

    return {
      total: all.length,
      active: all.filter(c => !c.isArchived && c.status === 'ACTIVE').length,
      inactive: all.filter(c => !c.isArchived && c.status !== 'ACTIVE').length,
      archived: all.filter(c => c.isArchived).length,
      individual: all.filter(c => !c.isArchived && c.clientType === 'INDIVIDUAL').length,
      business: all.filter(c => !c.isArchived && c.clientType !== 'INDIVIDUAL').length,
      recentlyAdded: all.filter(c => !c.isArchived && c.createdAt >= startOfWeek).length,
    };
  }

  public async getByEmployee(employeeId: string): Promise<Client[]> {
    const all = await this.getAll();
    return all.filter(c => 
      (c.employeeIds && c.employeeIds.includes(employeeId)) || 
      c.managerId === employeeId
    );
  }
}

export const clientService = new ClientService();
