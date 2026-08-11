import { clientService } from './ClientService';
import { taskService } from './TaskService';
import { employeeService } from './EmployeeService';
import { activityLogService } from './ActivityLogService';
import { notificationService } from './NotificationService';
import { EmployeeWorkload, WorkloadLevel, AssignmentStats, Client, AppTask, Employee } from '@/types';

class AssignmentService {
  
  // ==========================
  // CLIENT ASSIGNMENT
  // ==========================

  public async assignClientManager(clientId: string, managerId: string): Promise<void> {
    const client = await this.validateClient(clientId);
    const manager = await this.validateActiveEmployee(managerId);

    const prevManagerId = client.managerId;
    if (prevManagerId === managerId) return; // No change

    await clientService.update(clientId, { managerId });
    
    // Log
    if (prevManagerId) {
      await this.log('Update', 'Clients', 'Client', clientId, client.clientName, `Reassigned primary manager from Employee ${prevManagerId} to ${manager.firstName}`);
      await notificationService.createNotification(`Manager Reassigned`, `You are the new primary manager for ${client.clientName}.`, 'SYSTEM', 'HIGH', managerId, 'CLIENTS');
    } else {
      await this.log('Update', 'Clients', 'Client', clientId, client.clientName, `Assigned ${manager.firstName} as primary manager`);
      await notificationService.createNotification(`Manager Assignment`, `You have been assigned as the primary manager for ${client.clientName}.`, 'SYSTEM', 'NORMAL', managerId, 'CLIENTS');
    }
  }

  public async reassignClientManager(clientId: string, newManagerId: string): Promise<void> {
    return this.assignClientManager(clientId, newManagerId);
  }

  public async assignClientEmployees(clientId: string, employeeIds: string[]): Promise<void> {
    const client = await this.validateClient(clientId);
    const activeIds = await this.filterActiveEmployees(employeeIds);
    
    // Merge without duplicates
    const newEmployeeSet = new Set([...(client.employeeIds || []), ...activeIds]);
    const mergedIds = Array.from(newEmployeeSet);

    if (mergedIds.length === (client.employeeIds || []).length) return;

    await clientService.update(clientId, { employeeIds: mergedIds });

    await this.log('Update', 'Clients', 'Client', clientId, client.clientName, `Assigned ${activeIds.length} new employees to client team.`);
    
    for (const id of activeIds) {
      if (!(client.employeeIds || []).includes(id)) {
        await notificationService.createNotification(`Client Team Assignment`, `You have been added to the team for ${client.clientName}.`, 'SYSTEM', 'NORMAL', id, 'CLIENTS');
      }
    }
  }

  public async removeClientEmployee(clientId: string, employeeId: string): Promise<void> {
    const client = await this.validateClient(clientId);
    const current = client.employeeIds || [];
    if (!current.includes(employeeId)) return;

    const updated = current.filter(id => id !== employeeId);
    await clientService.update(clientId, { employeeIds: updated });
    
    await this.log('Update', 'Clients', 'Client', clientId, client.clientName, `Removed employee ${employeeId} from client team.`);
  }

  public async reassignClientEmployees(clientId: string, employeeIds: string[]): Promise<void> {
    const client = await this.validateClient(clientId);
    const activeIds = await this.filterActiveEmployees(employeeIds);
    
    await clientService.update(clientId, { employeeIds: activeIds });
    await this.log('Update', 'Clients', 'Client', clientId, client.clientName, `Reassigned entire client team.`);
  }

  // ==========================
  // TASK ASSIGNMENT
  // ==========================

  public async assignTaskEmployees(taskId: string, employeeIds: string[]): Promise<void> {
    const task = await this.validateTask(taskId);
    const activeIds = await this.filterActiveEmployees(employeeIds);
    
    const newEmployeeSet = new Set([...(task.employeeIds || []), ...activeIds]);
    const mergedIds = Array.from(newEmployeeSet);

    if (mergedIds.length === (task.employeeIds || []).length) return;

    await taskService.update(taskId, { employeeIds: mergedIds });
    await this.log('Update', 'Tasks', 'Task', taskId, task.taskName, `Assigned ${activeIds.length} new employees to task.`);
    
    for (const id of activeIds) {
      if (!(task.employeeIds || []).includes(id)) {
        await notificationService.createNotification(`Task Assigned`, `You have been assigned to task: ${task.taskName}.`, 'SYSTEM', 'HIGH', id, 'TASKS');
      }
    }
  }

  public async removeTaskEmployee(taskId: string, employeeId: string): Promise<void> {
    const task = await this.validateTask(taskId);
    const current = task.employeeIds || [];
    if (!current.includes(employeeId)) return;

    const updated = current.filter(id => id !== employeeId);
    await taskService.update(taskId, { employeeIds: updated });
    
    await this.log('Update', 'Tasks', 'Task', taskId, task.taskName, `Removed employee ${employeeId} from task.`);
  }

  public async reassignTaskEmployees(taskId: string, employeeIds: string[]): Promise<void> {
    const task = await this.validateTask(taskId);
    const activeIds = await this.filterActiveEmployees(employeeIds);
    
    await taskService.update(taskId, { employeeIds: activeIds });
    await this.log('Update', 'Tasks', 'Task', taskId, task.taskName, `Reassigned entire task team.`);
  }

  // ==========================
  // WORKLOAD & QUERIES
  // ==========================

  public async getEmployeeWorkload(employeeId: string): Promise<EmployeeWorkload> {
    const employee = await this.validateActiveEmployee(employeeId);
    
    const clients = await clientService.getAll();
    const tasks = await taskService.getAll();

    const activeClients = clients.filter(c => !c.isArchived && (c.managerId === employeeId || (c.employeeIds && c.employeeIds.includes(employeeId))));
    const employeeTasks = tasks.filter(t => !t.isArchived && t.employeeIds && t.employeeIds.includes(employeeId));

    const pendingTasks = employeeTasks.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED');
    const inProgressTasks = employeeTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ON_HOLD' || t.status === 'UNDER_REVIEW');
    const completedTasks = employeeTasks.filter(t => t.status === 'COMPLETED');
    
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = employeeTasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'COMPLETED');

    // Score: Active Clients + Active Tasks + Overdue Tasks
    const activeTaskCount = pendingTasks.length + inProgressTasks.length;
    const workloadScore = activeClients.length + activeTaskCount + overdueTasks.length;

    let workloadLevel: WorkloadLevel = 'Low';
    if (workloadScore > 30) workloadLevel = 'Critical';
    else if (workloadScore > 20) workloadLevel = 'High';
    else if (workloadScore > 10) workloadLevel = 'Medium';

    return {
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      departmentName: employee.departmentName,
      designationName: employee.designationName,
      activeClients: activeClients.length,
      totalTasks: employeeTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      workloadScore,
      workloadLevel
    };
  }

  public async getAllEmployeeWorkloads(): Promise<EmployeeWorkload[]> {
    const employees = await employeeService.getAll();
    const activeEmployees = employees.filter(e => !e.isArchived && e.status !== 'INACTIVE');
    
    const workloads = await Promise.all(
      activeEmployees.map(e => this.getEmployeeWorkload(e.id))
    );
    
    return workloads.sort((a, b) => b.workloadScore - a.workloadScore);
  }

  public async getUnassignedClients(): Promise<Client[]> {
    const clients = await clientService.getAll();
    return clients.filter(c => !c.isArchived && (!c.managerId && (!c.employeeIds || c.employeeIds.length === 0)));
  }

  public async getUnassignedTasks(): Promise<AppTask[]> {
    const tasks = await taskService.getAll();
    return tasks.filter(t => !t.isArchived && (!t.employeeIds || t.employeeIds.length === 0));
  }

  public async getDashboardStats(): Promise<AssignmentStats> {
    const clients = await clientService.getAll();
    const tasks = await taskService.getAll();
    const workloads = await this.getAllEmployeeWorkloads();

    const unassignedClients = clients.filter(c => !c.isArchived && (!c.managerId && (!c.employeeIds || c.employeeIds.length === 0))).length;
    const unassignedTasks = tasks.filter(t => !t.isArchived && (!t.employeeIds || t.employeeIds.length === 0)).length;
    
    const highWorkloadEmployees = workloads.filter(w => w.workloadLevel === 'High' || w.workloadLevel === 'Critical').length;
    
    const today = new Date().toISOString().split('T')[0];
    const overdueAssignments = tasks.filter(t => !t.isArchived && t.dueDate && t.dueDate < today && t.status !== 'COMPLETED').length;

    return {
      totalAssignedClients: clients.filter(c => !c.isArchived).length - unassignedClients,
      unassignedClients,
      totalAssignedTasks: tasks.filter(t => !t.isArchived).length - unassignedTasks,
      unassignedTasks,
      highWorkloadEmployees,
      overdueAssignments
    };
  }

  public async getClientTeam(clientId: string): Promise<{ manager?: Employee, employees: Employee[] }> {
    const client = await this.validateClient(clientId);
    const allEmployees = await employeeService.getAll();
    
    const manager = allEmployees.find(e => e.id === client.managerId);
    const employees = allEmployees.filter(e => (client.employeeIds || []).includes(e.id));
    
    return { manager, employees };
  }

  public async getTaskTeam(taskId: string): Promise<Employee[]> {
    const task = await this.validateTask(taskId);
    const allEmployees = await employeeService.getAll();
    return allEmployees.filter(e => (task.employeeIds || []).includes(e.id));
  }

  public async getAssignmentHistory(entityType: string, entityId: string): Promise<any[]> {
    const logs = await activityLogService.getAll(true);
    return logs.filter(l => l.entityType === entityType && l.entityId === entityId && l.action === 'Update' && l.description.toLowerCase().includes('assign'))
               .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ==========================
  // HELPERS
  // ==========================

  private async validateClient(id: string): Promise<Client> {
    const client = await clientService.getById(id);
    if (!client) throw new Error('Client not found');
    if (client.isArchived) throw new Error('Cannot assign to archived client');
    return client;
  }

  private async validateTask(id: string): Promise<AppTask> {
    const task = await taskService.getById(id);
    if (!task) throw new Error('Task not found');
    if (task.isArchived) throw new Error('Cannot assign to archived task');
    return task;
  }

  private async validateActiveEmployee(id: string): Promise<Employee> {
    const emp = await employeeService.getById(id);
    if (!emp) throw new Error('Employee not found');
    if (emp.isArchived || emp.status === 'INACTIVE') throw new Error(`Employee ${emp.firstName} is not active`);
    return emp;
  }

  private async filterActiveEmployees(ids: string[]): Promise<string[]> {
    const all = await employeeService.getAll();
    return ids.filter(id => {
      const emp = all.find(e => e.id === id);
      return emp && !emp.isArchived && emp.status !== 'INACTIVE';
    });
  }

  private async log(action: any, module: any, entityType: string, entityId: string, entityName: string, desc: string) {
    await activityLogService.log({
      action,
      module,
      entityType,
      entityId,
      entityName,
      description: desc,
      severity: 'Info'
    });
  }
}

export const assignmentService = new AssignmentService();
