import React, { useEffect, useState } from 'react';
import { AppTask, Employee } from '@/types';
import { assignmentService } from '@/services/AssignmentService';
import { employeeService } from '@/services/EmployeeService';
import { designationService } from '@/services/DesignationService';
import { Button } from '@/components/ui/Button';
import { UserPlus, UserMinus, Shield, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  task: AppTask;
  managerName: string;
  onUpdate: () => void;
}

export const TaskTeamManager: React.FC<Props> = ({ task, managerName, onUpdate }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allActiveEmployees, setAllActiveEmployees] = useState<Employee[]>([]);
  const [designations, setDesignations] = useState<Record<string, string>>({});
  
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [task]);

  const fetchData = async () => {
    setLoading(true);
    const emps = await assignmentService.getTaskTeam(task.id);
    setEmployees(emps);
    
    const all = await employeeService.getAll();
    setAllActiveEmployees(all.filter(e => !e.isArchived && e.status !== 'INACTIVE'));
    
    const desigs = await designationService.getAll();
    const desigMap = desigs.reduce((acc, d) => ({ ...acc, [d.id]: d.name }), {} as Record<string, string>);
    setDesignations(desigMap);
    
    setLoading(false);
  };

  const handleAddEmployee = async () => {
    if (!selectedEmployeeId) return;
    try {
      await assignmentService.assignTaskEmployees(task.id, [selectedEmployeeId]);
      toast.success('Employee assigned to task');
      setIsAssigning(false);
      onUpdate();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign employee');
    }
  };

  const handleRemoveEmployee = async (empId: string) => {
    try {
      await assignmentService.removeTaskEmployee(task.id, empId);
      toast.success('Employee removed from task');
      onUpdate();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove employee');
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;

  const availableForTeam = allActiveEmployees.filter(e => !employees.find(emp => emp.id === e.id));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Assignment Details</h3>
      
      <div className="space-y-4 mb-6">
        <div>
           <p className="text-xs text-gray-500 flex items-center gap-2 mb-1"><User size={14} /> Client Manager</p>
           <p className="text-sm font-medium text-gray-900">{managerName}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Shield size={16} className="text-blue-600"/> Assigned Team ({employees.length})</h4>
          {!isAssigning && !task.isArchived && (
            <Button variant="ghost" size="sm" onClick={() => setIsAssigning(true)} className="h-7 text-xs text-primary px-2">
              <UserPlus size={12} className="mr-1" /> Add
            </Button>
          )}
        </div>

        {isAssigning && (
          <div className="flex flex-col gap-2 mb-4 bg-gray-50 p-3 rounded border border-gray-200">
            <select 
              className="text-sm border-gray-300 rounded focus:ring-primary focus:border-primary w-full"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              <option value="">Select an employee...</option>
              {availableForTeam.map(e => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} - {designations[e.designationId] || 'Employee'}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAssigning(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddEmployee} disabled={!selectedEmployeeId}>Assign</Button>
            </div>
          </div>
        )}

        {employees.length === 0 ? (
          <p className="text-xs text-gray-500 italic p-3 bg-orange-50 text-orange-700 rounded border border-dashed border-orange-200 text-center">
            No employees assigned to this task.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
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
                {!task.isArchived && (
                  <button 
                    onClick={() => handleRemoveEmployee(emp.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove from task"
                  >
                    <UserMinus size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
