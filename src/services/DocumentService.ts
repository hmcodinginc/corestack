import { StorageService } from './StorageService';
import { AppDocument, DocumentStats } from '@/types/document';
import { activityLogService } from './ActivityLogService';
import { notificationService } from './NotificationService';
import { clientService } from './ClientService';

class DocumentService extends StorageService<AppDocument> {
  constructor() {
    super('documents');
  }

  private generateDocumentNumber(): string {
    const all = this.readData();
    const count = all.length + 1;
    return `DOC-${count.toString().padStart(4, '0')}`;
  }

  public async uploadDocument(doc: Omit<AppDocument, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt' | 'documentNumber' | 'version'>): Promise<AppDocument> {
    const created = await this.create(doc);
    
    // Notify uploader or firm admin
    await notificationService.createNotification(
      `Document Uploaded: ${created.documentName}`,
      `A new ${created.category} document was uploaded successfully.`,
      'Document Uploaded',
      'NORMAL',
      created.uploadedBy || 'EMP-1',
      'DOCUMENTS',
      created.id,
      `/documents`
    );

    return created;
  }

  public async create(item: Omit<AppDocument, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt' | 'documentNumber' | 'version'>): Promise<AppDocument> {
    await this.delay();
    
    const newDoc: Omit<AppDocument, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'> = {
      ...item,
      documentNumber: this.generateDocumentNumber(),
      version: 1,
    };

    const created = await super.create(newDoc);
    
    await activityLogService.log({
      action: 'Create',
      module: 'Documents',
      entityType: 'Document',
      entityId: created.id,
      entityName: created.documentName,
      description: `Uploaded document ${created.documentName} for Client ID: ${created.clientId}`
    });

    return created;
  }

  public async update(id: string, updates: Partial<AppDocument>, isNewVersion = false): Promise<AppDocument> {
    await this.delay();
    const existing = await this.getById(id);
    if (!existing) throw new Error('Document not found');

    if (isNewVersion) {
      updates.version = existing.version + 1;
    }

    const updated = await super.update(id, updates);

    await activityLogService.log({
      action: 'Update',
      module: 'Documents',
      entityType: 'Document',
      entityId: updated.id,
      entityName: updated.documentName,
      description: isNewVersion ? `Uploaded new version v${updated.version} of ${updated.documentName}` : `Updated metadata for ${updated.documentName}`,
      previousValue: existing,
      newValue: updated
    });

    return updated;
  }

  public async archive(id: string): Promise<AppDocument> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Document not found');

    const archived = await super.archive(id);
    await activityLogService.log({
      action: 'Archive',
      module: 'Documents',
      entityType: 'Document',
      entityId: archived.id,
      entityName: archived.documentName,
      description: `Archived document ${archived.documentName}`,
      previousValue: { status: 'Active' },
      newValue: { status: 'Archived' }
    });
    return archived;
  }

  public async restore(id: string): Promise<AppDocument> {
    const restored = await super.restore(id);
    await activityLogService.log({
      action: 'Restore',
      module: 'Documents',
      entityType: 'Document',
      entityId: restored.id,
      entityName: restored.documentName,
      description: `Restored document ${restored.documentName}`,
      previousValue: { status: 'Archived' },
      newValue: { status: 'Active' }
    });
    return restored;
  }

  public async getById(id: string): Promise<AppDocument | null> {
    const doc = await super.getById(id);
    if (doc) {
      await activityLogService.log({
        action: 'View',
        module: 'Documents',
        entityType: 'Document',
        entityId: doc.id,
        entityName: doc.documentName,
        description: `Viewed document ${doc.documentName}`,
        severity: 'Info'
      });
    }
    
    return doc || null;
  }


  public async getStats(): Promise<DocumentStats> {
    await this.delay(100);
    const all = this.readData();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const activeDocs = all.filter(d => !d.isArchived);

    const byCategory = activeDocs.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: activeDocs.length,
      uploadedToday: activeDocs.filter(d => d.createdAt.startsWith(todayStr)).length,
      pending: activeDocs.filter(d => d.status === 'PENDING').length,
      archived: all.filter(d => d.isArchived).length,
      missing: 0, // In a real system, you'd calculate required documents minus existing
      byCategory,
    };
  }

  public async getByEmployee(employeeId: string): Promise<AppDocument[]> {
    const all = await this.getAll();
    
    // Filter documents where the client is assigned to the employee,
    // or the employee uploaded the document.
    const myClients = await clientService.getByEmployee(employeeId);
    const myClientIds = myClients.map(c => c.id);
    
    return all.filter(doc => myClientIds.includes(doc.clientId) || doc.uploadedBy === employeeId);
  }
}

export const documentService = new DocumentService();
