import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { assignmentService } from '@/services/AssignmentService';
import { Client, AppTask } from '@/types';
import { Button } from '@/components/ui/Button';
import { Briefcase, CheckSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UnassignedWork: React.FC = () => {
  const [unassignedClients, setUnassignedClients] = useState<Client[]>([]);
  const [unassignedTasks, setUnassignedTasks] = useState<AppTask[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      assignmentService.getUnassignedClients(),
      assignmentService.getUnassignedTasks()
    ]).then(([clients, tasks]) => {
      setUnassignedClients(clients);
      setUnassignedTasks(tasks);
      setLoading(false);
    });
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Unassigned Work"
        description="Clients and tasks that currently have no assigned managers or team members."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Assignments', path: '/assignments' }, { label: 'Unassigned Work' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Unassigned Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-gray-100 bg-orange-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Briefcase size={18} className="text-orange-600"/> Unassigned Clients
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">{unassignedClients.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {loading ? (
              <div className="text-center text-gray-500 animate-pulse mt-10">Loading...</div>
            ) : unassignedClients.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">All active clients have assignments.</div>
            ) : (
              unassignedClients.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between hover:border-primary transition-colors">
                  <div>
                    <h4 className="font-semibold text-gray-900">{c.clientName}</h4>
                    <p className="text-xs text-gray-500">{c.clientType.replace('_', ' ')}</p>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/clients/${c.id}`)}>
                    Assign <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unassigned Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-gray-100 bg-orange-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare size={18} className="text-orange-600"/> Unassigned Tasks
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">{unassignedTasks.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {loading ? (
              <div className="text-center text-gray-500 animate-pulse mt-10">Loading...</div>
            ) : unassignedTasks.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">All active tasks have assignees.</div>
            ) : (
              unassignedTasks.map(t => (
                <div key={t.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between hover:border-primary transition-colors">
                  <div className="mr-4">
                    <h4 className="font-semibold text-gray-900 line-clamp-1" title={t.taskName}>{t.taskName}</h4>
                    <p className="text-xs text-gray-500">For: {t.clientName || 'Unknown Client'}</p>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/tasks/${t.id}`)} className="shrink-0">
                    Assign <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default UnassignedWork;
