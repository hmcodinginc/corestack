import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { assignmentService } from '@/services/AssignmentService';
import { EmployeeWorkload } from '@/types/assignment';
import { Button } from '@/components/ui/Button';
import { Search, Eye, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployeeWorkloadList: React.FC = () => {
  const [workloads, setWorkloads] = useState<EmployeeWorkload[]>([]);
  const [filtered, setFiltered] = useState<EmployeeWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const fetchWorkloads = async () => {
    const data = await assignmentService.getAllEmployeeWorkloads();
    setWorkloads(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!search) {
      setFiltered(workloads);
      return;
    }
    const q = search.toLowerCase();
    const result = workloads.filter(w => 
      w.employeeName.toLowerCase().includes(q) || 
      (w.departmentName || '').toLowerCase().includes(q) ||
      (w.designationName || '').toLowerCase().includes(q) ||
      w.workloadLevel.toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [search, workloads]);

  const getWorkloadBadge = (level: string) => {
    switch(level) {
      case 'Critical': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Critical</span>;
      case 'High': return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">High</span>;
      case 'Medium': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Medium</span>;
      default: return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Low</span>;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Employee Workload"
        description="Monitor active assignments, pending tasks, and overall workload for each employee."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Assignments', path: '/assignments' }, { label: 'Workload' }]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search employee, department, level..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} /> Filters
          </Button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Employee</th>
                <th className="p-4 font-semibold text-gray-600">Department</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Active Clients</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Active Tasks</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Overdue</th>
                <th className="p-4 font-semibold text-gray-600">Workload Score</th>
                <th className="p-4 font-semibold text-gray-600">Level</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 animate-pulse">Calculating Workloads...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">No employees match your search.</td>
                </tr>
              ) : (
                filtered.map(w => (
                  <tr key={w.employeeId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{w.employeeName}</div>
                      <div className="text-xs text-gray-500">{w.designationName || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-gray-600">{w.departmentName || 'N/A'}</td>
                    <td className="p-4 text-center font-medium text-gray-900">{w.activeClients}</td>
                    <td className="p-4 text-center font-medium text-gray-900">{w.pendingTasks + w.inProgressTasks}</td>
                    <td className="p-4 text-center font-bold text-red-600">{w.overdueTasks > 0 ? w.overdueTasks : '-'}</td>
                    <td className="p-4 font-mono font-medium text-gray-700">{w.workloadScore} pts</td>
                    <td className="p-4">{getWorkloadBadge(w.workloadLevel)}</td>
                    <td className="p-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/assignments/workload/${w.employeeId}`)}
                        className="text-primary hover:bg-primary/10"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};

export default EmployeeWorkloadList;
