export type WorkloadLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface EmployeeWorkload {
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  designationName?: string;
  
  activeClients: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  
  workloadScore: number;
  workloadLevel: WorkloadLevel;
}

export interface AssignmentStats {
  totalAssignedClients: number;
  unassignedClients: number;
  totalAssignedTasks: number;
  unassignedTasks: number;
  highWorkloadEmployees: number;
  overdueAssignments: number;
}
