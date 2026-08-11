import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { assignmentService } from '@/services/AssignmentService';
import { clientService } from '@/services/ClientService';
import { taskService } from '@/services/TaskService';
import { EmployeeWorkload, Client, AppTask } from '@/types';
import { Button } from '@/components/ui/Button';
import { Briefcase, CheckSquare, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';

export const EmployeeWorkloadDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workload, setWorkload] = useState<EmployeeWorkload | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const wl = await assignmentService.getEmployeeWorkload(id);
        setWorkload(wl);
        
        const allClients = await clientService.getAll();
        const empClients = allClients.filter(c => !c.isArchived && (c.managerId === id || (c.employeeIds && c.employeeIds.includes(id))));
        setClients(empClients);

        const allTasks = await taskService.getAll();
        const empTasks = allTasks.filter(t => !t.isArchived && t.employeeIds && t.employeeIds.includes(id));
        setTasks(empTasks);

        setLoading(false);
      } catch (e) {
        navigate('/assignments/workload');
      }
    };
    load();
  }, [id, navigate]);

  if (loading || !workload) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Workload Details...</div>;

  const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ON_HOLD' || t.status === 'UNDER_REVIEW');
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'COMPLETED');

  return (
    <PageContainer>
      <PageHeader
        title={`${workload.employeeName}'s Workload`}
        description={`${workload.designationName || 'Employee'} • ${workload.departmentName || 'No Department'}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' }, 
          { label: 'Assignments', path: '/assignments' }, 
          { label: 'Workload', path: '/assignments/workload' },
          { label: workload.employeeName }
        ]}
        action={
          <Button variant="outline" onClick={() => navigate('/assignments/workload')}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 mb-1">Score</p>
          <p className="text-2xl font-bold text-gray-900">{workload.workloadScore}</p>
        </div>
        <div className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center ${workload.workloadLevel === 'Critical' ? 'border-red-300 bg-red-50' : ''}`}>
          <p className="text-xs text-gray-500 mb-1">Level</p>
          <p className={`text-2xl font-bold ${workload.workloadLevel === 'Critical' ? 'text-red-700' : 'text-primary'}`}>{workload.workloadLevel}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 mb-1">Active Clients</p>
          <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 mb-1">Active Tasks</p>
          <p className="text-2xl font-bold text-gray-900">{pendingTasks.length + inProgressTasks.length}</p>
        </div>
        <div className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center ${overdueTasks.length > 0 ? 'border-red-300 bg-red-50' : ''}`}>
          <p className="text-xs text-gray-500 mb-1">Overdue Tasks</p>
          <p className={`text-2xl font-bold ${overdueTasks.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{overdueTasks.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Assigned Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-blue-50/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-600"/> Assigned Clients
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{clients.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {clients.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No clients assigned.</div>
            ) : (
              clients.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between hover:border-primary transition-colors">
                  <div>
                    <h4 className="font-semibold text-gray-900">{c.clientName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{c.clientType}</p>
                      {c.managerId === workload.employeeId && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">MANAGER</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/clients/${c.id}`)}>
                    <ArrowRight size={16} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-blue-50/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare size={18} className="text-blue-600"/> Assigned Tasks
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{tasks.length} Total</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {tasks.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No tasks assigned.</div>
            ) : (
              tasks.sort((a,b) => {
                const aOverdue = a.dueDate && a.dueDate < today && a.status !== 'COMPLETED' ? 1 : 0;
                const bOverdue = b.dueDate && b.dueDate < today && b.status !== 'COMPLETED' ? 1 : 0;
                return bOverdue - aOverdue; // Overdue first
              }).map(t => {
                const isOverdue = t.dueDate && t.dueDate < today && t.status !== 'COMPLETED';
                return (
                  <div key={t.id} className={`bg-white p-4 rounded-lg border shadow-sm hover:border-primary transition-colors ${isOverdue ? 'border-red-200 border-l-4 border-l-red-500' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-1" title={t.taskName}>{t.taskName}</h4>
                      {isOverdue && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <p>Due: <span className={isOverdue ? 'text-red-600 font-bold' : ''}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</span></p>
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{t.status}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default EmployeeWorkloadDetails;
