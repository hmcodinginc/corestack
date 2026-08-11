import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { assignmentService } from '@/services/AssignmentService';
import { AssignmentStats } from '@/types/assignment';
import { Users, Briefcase, CheckSquare, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const AssignmentDashboard: React.FC = () => {
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    assignmentService.getDashboardStats().then(s => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Dashboard...</div>;

  return (
    <PageContainer>
      <PageHeader
        title="Assignment & Work Allocation"
        description="Centralized dashboard for tracking resource allocation and employee workload."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Assignments' }]}
        action={
          <Button onClick={() => navigate('/assignments/workload')} className="flex items-center gap-2">
            <Users size={16} /> View Employee Workload
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Unassigned Clients */}
        <div 
          onClick={() => navigate('/assignments/unassigned')}
          className={`bg-white p-5 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${stats.unassignedClients > 0 ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${stats.unassignedClients > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
              <Briefcase size={18} />
              <span className="text-sm font-semibold">Unassigned Clients</span>
            </div>
          </div>
          <span className={`text-3xl font-bold ${stats.unassignedClients > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
            {stats.unassignedClients}
          </span>
          {stats.unassignedClients > 0 && <p className="text-xs text-orange-600 mt-2 font-medium">Needs Attention</p>}
        </div>

        {/* Unassigned Tasks */}
        <div 
          onClick={() => navigate('/assignments/unassigned')}
          className={`bg-white p-5 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${stats.unassignedTasks > 0 ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${stats.unassignedTasks > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
              <CheckSquare size={18} />
              <span className="text-sm font-semibold">Unassigned Tasks</span>
            </div>
          </div>
          <span className={`text-3xl font-bold ${stats.unassignedTasks > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
            {stats.unassignedTasks}
          </span>
          {stats.unassignedTasks > 0 && <p className="text-xs text-orange-600 mt-2 font-medium">Needs Attention</p>}
        </div>

        {/* High Workload Employees */}
        <div 
          onClick={() => navigate('/assignments/workload')}
          className={`bg-white p-5 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${stats.highWorkloadEmployees > 0 ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${stats.highWorkloadEmployees > 0 ? 'text-red-600' : 'text-gray-500'}`}>
              <AlertTriangle size={18} />
              <span className="text-sm font-semibold">High Workload Staff</span>
            </div>
          </div>
          <span className={`text-3xl font-bold ${stats.highWorkloadEmployees > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {stats.highWorkloadEmployees}
          </span>
          {stats.highWorkloadEmployees > 0 && <p className="text-xs text-red-600 mt-2 font-medium">Risk of burnout</p>}
        </div>

        {/* Overdue Assignments */}
        <div className={`bg-white p-5 rounded-xl border shadow-sm ${stats.overdueAssignments > 0 ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${stats.overdueAssignments > 0 ? 'text-red-600' : 'text-gray-500'}`}>
              <Clock size={18} />
              <span className="text-sm font-semibold">Overdue Work</span>
            </div>
          </div>
          <span className={`text-3xl font-bold ${stats.overdueAssignments > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {stats.overdueAssignments}
          </span>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-3xl mx-auto mt-12">
        <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase size={28} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Unassigned Work</h3>
        <p className="text-gray-500 text-sm mb-6">
          Ensure no client or task falls through the cracks. Assign managers and team members to pending work.
        </p>
        <Button onClick={() => navigate('/assignments/unassigned')} size="lg" className="px-8 shadow-md">
          Go to Unassigned Work
        </Button>
      </div>
      
    </PageContainer>
  );
};

export default AssignmentDashboard;
