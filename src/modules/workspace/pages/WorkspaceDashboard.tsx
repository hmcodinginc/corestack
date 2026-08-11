import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/layout/StatsCard';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
// import { taskService } from '@/services/taskService'; // To be implemented by user

export const WorkspaceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pending: 0, completed: 0, overdue: 0 });

  useEffect(() => {
    // Mock fetch for personal stats
    // const fetchStats = async () => {
    //   if (user) {
    //     const userTasks = await taskService.getTasksByEmployee(user.id);
    //     // calculate stats...
    //   }
    // };
    // fetchStats();
    
    // Placeholder stats
    setStats({ pending: 5, completed: 12, overdue: 1 });
  }, [user]);

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'Employee'}`}
        description="Here is an overview of your workspace"
      />
      
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatsCard
          title="Pending Tasks"
          value={stats.pending.toString()}
          icon={Clock}
        />
        <StatsCard
          title="Completed Tasks"
          value={stats.completed.toString()}
          icon={CheckSquare}
        />
        <StatsCard
          title="Overdue Tasks"
          value={stats.overdue.toString()}
          icon={AlertTriangle}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Recent Tasks</h2>
        <div className="text-sm text-gray-500">
          Task list will appear here once connected to the service.
        </div>
      </div>
    </PageContainer>
  );
};

export default WorkspaceDashboard;
