import React, { useEffect, useState } from 'react';
import { SectionCard } from '@/components/layout/SectionCard';
import { assignmentService } from '@/services/AssignmentService';
import { employeeService } from '@/services/EmployeeService';
import { designationService } from '@/services/DesignationService';
import { Employee, Client } from '@/types';
import { Button } from '@/components/ui/Button';
import { UserPlus, UserMinus, RefreshCw, Shield, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  client: Client;
  onUpdate: () => void;
}

export const ClientTeamManager: React.FC<Props> = ({ client, onUpdate }) => {
  const [manager, setManager] = useState<Employee | undefined>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allActiveEmployees, setAllActiveEmployees] = useState<Employee[]>([]);
  const [designations, setDesignations] = useState<Record<string, string>>({});
  
  const [isAssigningManager, setIsAssigningManager] = useState(false);
  const [isAssigningEmployee, setIsAssigningEmployee] = useState(false);
  
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [client]);

  const fetchData = async () => {
    setLoading(true);
    const { manager: mgr, employees: emps } = await assignmentService.getClientTeam(client.id);
    setManager(mgr);
    setEmployees(emps);
    
    const all = await employeeService.getAll();
    setAllActiveEmployees(all.filter(e => !e.isArchived && e.status !== 'INACTIVE'));
    
    const desigs = await designationService.getAll();
    const desigMap = desigs.reduce((acc, d) => ({ ...acc, [d.id]: d.name }), {} as Record<string, string>);
    setDesignations(desigMap);
    
    setLoading(false);
  };

  const handleAssignManager = async () => {
    if (!selectedManagerId) return;
    try {
      if (manager) {
        await assignmentService.reassignClientManager(client.id, selectedManagerId);
        toast.success('Manager reassigned successfully');
      } else {
        await assignmentService.assignClientManager(client.id, selectedManagerId);
        toast.success('Manager assigned successfully');
      }
      setIsAssigningManager(false);
      onUpdate();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign manager');
    }
  };

  const handleAddEmployee = async () => {
    if (!selectedEmployeeId) return;
    try {
      await assignmentService.assignClientEmployees(client.id, [selectedEmployeeId]);
      toast.success('Employee added to client team');
      setIsAssigningEmployee(false);
      onUpdate();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add employee');
    }
  };

  const handleRemoveEmployee = async (empId: string) => {
    try {
      await assignmentService.removeClientEmployee(client.id, empId);
      toast.success('Employee removed from team');
      onUpdate();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove employee');
    }
  };

  if (loading) return <SectionCard title="Client Team"><div className="animate-pulse h-20 bg-gray-100 rounded"></div></SectionCard>;

  const availableForManager = allActiveEmployees.filter(e => e.id !== manager?.id);
  const availableForTeam = allActiveEmployees.filter(e => !employees.find(emp => emp.id === e.id) && e.id !== manager?.id);

  return (
    <SectionCard title="Client Team Management">
      
      {/* Primary Manager */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><UserCheck size={16} className="text-green-600"/> Primary Manager</h4>
          {!isAssigningManager && (
            <Button variant="ghost" size="sm" onClick={() => setIsAssigningManager(true)} className="h-7 text-xs">
              <RefreshCw size={12} className="mr-1" /> {manager ? 'Reassign' : 'Assign'}
            </Button>
          )}
        </div>
        
        {isAssigningManager ? (
          <div className="flex gap-2 mb-3 bg-gray-50 p-2 rounded border border-gray-200">
            <select 
              className="flex-1 text-sm border-gray-300 rounded focus:ring-primary focus:border-primary"
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
            >
              <option value="">Select a manager...</option>
              {availableForManager.map(e => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} - {designations[e.designationId] || 'Employee'}</option>
              ))}
            </select>
            <Button size="sm" onClick={handleAssignManager} disabled={!selectedManagerId}>Save</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAssigningManager(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs shrink-0">
              {manager ? manager.firstName.charAt(0) : '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{manager ? `${manager.firstName} ${manager.lastName}` : 'Unassigned'}</p>
              {manager && <p className="text-xs text-gray-500">{designations[manager.designationId] || 'Manager'}</p>}
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-100 my-4" />

      {/* Assigned Employees */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Shield size={16} className="text-blue-600"/> Team Members ({employees.length})</h4>
          {!isAssigningEmployee && (
            <Button variant="ghost" size="sm" onClick={() => setIsAssigningEmployee(true)} className="h-7 text-xs text-primary">
              <UserPlus size={12} className="mr-1" /> Add Member
            </Button>
          )}
        </div>

        {isAssigningEmployee && (
          <div className="flex gap-2 mb-4 bg-gray-50 p-2 rounded border border-gray-200">
            <select 
              className="flex-1 text-sm border-gray-300 rounded focus:ring-primary focus:border-primary"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              <option value="">Select an employee...</option>
              {availableForTeam.map(e => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} - {designations[e.designationId] || 'Employee'}</option>
              ))}
            </select>
            <Button size="sm" onClick={handleAddEmployee} disabled={!selectedEmployeeId}>Add</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAssigningEmployee(false)}>Cancel</Button>
          </div>
        )}

        {employees.length === 0 ? (
          <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded border border-dashed border-gray-200 text-center">No additional team members assigned.</p>
        ) : (
          <div className="space-y-2">
            {employees.map(emp => (
              <div key={emp.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {emp.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[10px] text-gray-500">{designations[emp.designationId] || 'Employee'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveEmployee(emp.id)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Remove from team"
                >
                  <UserMinus size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </SectionCard>
  );
};
