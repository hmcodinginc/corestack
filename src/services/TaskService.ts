import { StorageService } from './StorageService';
import { AppTask, TaskStats } from '@/types/task';
import { activityLogService } from './ActivityLogService';
import { notificationService } from './NotificationService';
import { settingsService } from './SettingsService';

class TaskService extends StorageService<AppTask> {
  constructor() {
    super('tasks');
  }

  private generateTaskCode(): string {
    const all = this.readData();
    const count = all.length + 1;
    return `TSK-${count.toString().padStart(4, '0')}`;
  }

  public async create(item: Omit<AppTask, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt' | 'taskCode'>): Promise<AppTask> {
    await this.delay();
    
    if (item.employeeIds.length === 0) {
      throw new Error('Every task must have at least one assigned employee.');
    }

    const settings = settingsService.getSettings().tasks;

    const newTask: Omit<AppTask, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'archivedAt'> = {
      ...item,
      taskCode: this.generateTaskCode(),
      priority: item.priority || settings.defaultTaskPriority,
      status: item.status || settings.defaultTaskStatus,
    };

    const created = await super.create(newTask);
    
    await activityLogService.log({
      action: 'Create',
      module: 'Tasks',
      entityType: 'Task',
      entityId: created.id,
      entityName: created.taskName,
      description: `Created task ${created.taskCode} for Client ID: ${created.clientId}`
    });

    // Notify assignees
    if (created.employeeIds && created.employeeIds.length > 0) {
      for (const employeeId of created.employeeIds) {
        await notificationService.createNotification(
          `New Task Assigned: ${created.taskName}`,
          `You have been assigned a new task due on ${created.dueDate || 'N/A'}.`,
          'Task Assigned',
          created.priority === 'HIGH' ? 'HIGH' : 'NORMAL',
          employeeId,
          'TASKS',
          created.id,
          `/tasks/${created.id}`
        );
      }
    }

    return created;
  }

  public async update(id: string, updates: Partial<AppTask>): Promise<AppTask> {
    await this.delay();
    const existing = await this.getById(id);
    if (!existing) throw new Error('Task not found');
    
    if (existing.isArchived) {
       throw new Error('Archived tasks cannot be edited.');
    }

    if (updates.employeeIds && updates.employeeIds.length === 0) {
      throw new Error('Every task must have at least one assigned employee.');
    }

    const isStatusChanged = updates.status && updates.status !== existing.status;
    const isCompleted = updates.status === 'COMPLETED' && existing.status !== 'COMPLETED';

    if (isCompleted && !updates.completionDate) {
       updates.completionDate = new Date().toISOString().split('T')[0];
    }

    const updated = await super.update(id, updates);

    await activityLogService.log({
      action: 'Update',
      module: 'Tasks',
      entityType: 'Task',
      entityId: updated.id,
      entityName: updated.taskName,
      description: isCompleted 
        ? `Marked task ${updated.taskCode} as Completed` 
        : isStatusChanged 
          ? `Changed status of ${updated.taskCode} to ${updated.status}`
          : `Updated details for task ${updated.taskCode}`,
      previousValue: existing,
      newValue: updated
    });

    if (updates.employeeIds) {
      const newAssignees = updates.employeeIds.filter(id => !(existing.employeeIds || []).includes(id));
      for (const empId of newAssignees) {
        await notificationService.createNotification(
          `Task Reassigned: ${updated.taskCode}`,
          `You have been newly assigned to task: ${updated.taskName}`,
          'Task Assigned',
          'HIGH',
          empId,
          'TASKS',
          updated.id,
          `/workspace/tasks/${updated.id}`
        );
      }
    }

    if (isStatusChanged && updated.managerId) {
      // Notify manager that status changed
      await notificationService.createNotification(
        `Task Status Updated: ${updated.taskCode}`,
        `Task ${updated.taskName} status changed to ${updated.status}.`,
        'Task Update',
        'NORMAL',
        updated.managerId,
        'TASKS',
        updated.id,
        `/tasks/${updated.id}`
      );
    }

    return updated;
  }

  public async updateChecklist(taskId: string, checklistId: string, isCompleted: boolean): Promise<AppTask> {
    const existing = await this.getById(taskId);
    if (!existing) throw new Error('Task not found');
    
    const newChecklist = existing.checklist.map(item => 
      item.id === checklistId ? { ...item, isCompleted } : item
    );

    return this.update(taskId, { checklist: newChecklist });
  }

  public async archive(id: string): Promise<AppTask> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Task not found');
    if (existing.status !== 'COMPLETED' && existing.status !== 'CANCELLED') {
       // Optional business rule check, can be relaxed
    }

    const archived = await super.archive(id);
    await activityLogService.log({
      action: 'Archive',
      module: 'Tasks',
      entityType: 'Task',
      entityId: archived.id,
      entityName: archived.taskName,
      description: `Archived task ${archived.taskCode}`,
      previousValue: { status: 'Active' },
      newValue: { status: 'Archived' }
    });
    return archived;
  }

  public async restore(id: string): Promise<AppTask> {
    const restored = await super.restore(id);
    await activityLogService.log({
      action: 'Restore',
      module: 'Tasks',
      entityType: 'Task',
      entityId: restored.id,
      entityName: restored.taskName,
      description: `Restored task ${restored.taskCode}`,
      previousValue: { status: 'Archived' },
      newValue: { status: 'Active' }
    });
    return restored;
  }

  public async getStats(): Promise<TaskStats> {
    await this.delay(100);
    const all = this.readData().filter(t => !t.isArchived);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStr = today.toISOString().split('T')[0];

    let overdueCount = 0;
    let dueTodayCount = 0;

    all.forEach(t => {
      if (t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.dueDate) {
         const due = new Date(t.dueDate);
         due.setHours(0, 0, 0, 0);
         if (due < today) {
            overdueCount++;
         } else if (due.getTime() === today.getTime()) {
            dueTodayCount++;
         }
      }
    });

    return {
      total: all.length,
      pending: all.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED').length,
      inProgress: all.filter(t => t.status === 'IN_PROGRESS' || t.status === 'UNDER_REVIEW').length,
      completed: all.filter(t => t.status === 'COMPLETED').length,
      highPriority: all.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length,
      overdue: overdueCount,
      dueToday: dueTodayCount,
    };
  }

  public async getByEmployee(employeeId: string): Promise<AppTask[]> {
    const all = await this.getAll();
    return all.filter(t => t.employeeIds && t.employeeIds.includes(employeeId));
  }
}

export const taskService = new TaskService();
