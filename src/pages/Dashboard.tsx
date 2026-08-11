import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { activityLogService, AuditLog } from '@/services/ActivityLogService';
import { ShieldAlert, Info, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { assignmentService } from '@/services/AssignmentService';
import { AssignmentStats } from '@/types/assignment';

export const Dashboard: React.FC = () => {
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    activityLogService.getAll(true).then(logs => {
      const sorted = logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentLogs(sorted.slice(0, 10)); // Top 10
    });
    
    assignmentService.getDashboardStats().then(s => setStats(s));
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'Critical': return <ShieldAlert size={16} className="text-red-500" />;
      case 'Warning': return <ShieldAlert size={16} className="text-yellow-500" />;
      case 'Success': return <Activity size={16} className="text-green-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Welcome to CoreStack" 
        description="Your enterprise management dashboard." 
        breadcrumbs={[{ label: 'Dashboard' }]}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div 
              onClick={() => navigate('/assignments/unassigned')}
              className={`bg-white p-5 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${stats?.unassignedClients ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'}`}
            >
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Unassigned Clients</h3>
              <p className={`text-3xl font-bold ${stats?.unassignedClients ? 'text-orange-600' : 'text-gray-900'}`}>{stats?.unassignedClients || 0}</p>
            </div>

            <div 
              onClick={() => navigate('/assignments/unassigned')}
              className={`bg-white p-5 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${stats?.unassignedTasks ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'}`}
            >
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Unassigned Tasks</h3>
              <p className={`text-3xl font-bold ${stats?.unassignedTasks ? 'text-orange-600' : 'text-gray-900'}`}>{stats?.unassignedTasks || 0}</p>
            </div>

            <div 
              onClick={() => navigate('/assignments/workload')}
              className={`bg-white p-5 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${stats?.highWorkloadEmployees ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
            >
              <h3 className="text-sm font-semibold text-gray-500 mb-2">High Workload Staff</h3>
              <p className={`text-3xl font-bold ${stats?.highWorkloadEmployees ? 'text-red-600' : 'text-gray-900'}`}>{stats?.highWorkloadEmployees || 0}</p>
            </div>
            
            <div className={`bg-white p-5 rounded-xl border shadow-sm ${stats?.overdueAssignments ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Overdue Work</h3>
              <p className={`text-3xl font-bold ${stats?.overdueAssignments ? 'text-red-600' : 'text-gray-900'}`}>{stats?.overdueAssignments || 0}</p>
            </div>

          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Recent Activity Widget */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Activity size={16} className="text-primary"/> Recent Activity
              </h3>
              <button 
                onClick={() => navigate('/audit')}
                className="text-xs font-bold text-primary hover:underline"
              >
                View All
              </button>
            </div>
            <div className="p-0">
              {recentLogs.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">No recent activity</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentLogs.map(log => (
                    <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/audit/${log.id}`)}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-white rounded-full shadow-sm p-1 border border-gray-100">
                          {getSeverityIcon(log.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {log.module} <span className="text-gray-400 font-normal">/</span> {log.action}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5" title={log.description}>
                            {log.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {log.userName}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
};

export default Dashboard;
