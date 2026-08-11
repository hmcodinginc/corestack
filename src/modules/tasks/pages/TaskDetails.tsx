import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckSquare, Calendar, Clock, User, Building2, Tag, Edit, AlertCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/NotificationService';

import { AppTask } from '@/types/task';
import { taskService } from '@/services/TaskService';
import { clientService } from '@/services/ClientService';
import { employeeService } from '@/services/EmployeeService';
import { TaskTeamManager } from '../components/TaskTeamManager';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

export const TaskDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<AppTask | null>(null);
  const [clientName, setClientName] = useState('Loading...');
  const [assigneeNames, setAssigneeNames] = useState<string[]>([]);
  const [managerName, setManagerName] = useState('Unassigned');
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const t = await taskService.getById(id);
      if (!t) {
        navigate('/tasks');
        return;
      }
      setTask(t);
      
      const c = await clientService.getById(t.clientId);
      if (c) setClientName(c.clientName);
      
      const emps = await employeeService.getAll();
      setAssigneeNames(t.employeeIds.map(eid => {
         const emp = emps.find(e => e.id === eid);
         return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
      }));
      
      if (t.managerId) {
         const m = emps.find(e => e.id === t.managerId);
         if (m) setManagerName(`${m.firstName} ${m.lastName} - ${m.designationId}`);
      }
    };
    
    loadData();
  }, [id, navigate]);

  const handleToggleChecklist = async (checkId: string, currentStatus: boolean) => {
    if (!task || task.isArchived) return;
    
    // Optimistic Update
    const newStatus = !currentStatus;
    const newTask = {
      ...task,
      checklist: task.checklist.map(c => c.id === checkId ? { ...c, isCompleted: newStatus } : c)
    };
    setTask(newTask);

    try {
      const updated = await taskService.updateChecklist(task.id, checkId, newStatus);
      // Optional: setTask(updated) if you want to sync any backend changes, but not strictly needed 
      // if we trust the optimistic update.
    } catch (e: any) {
      // Revert on error
      setTask(task);
      toast.error(e.message || 'Failed to update checklist');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !task) return;
    
    const newNotes = task.notes ? `${task.notes}\n[${new Date().toLocaleDateString()}] ${user?.firstName || 'Admin'}: ${comment}` : `[${new Date().toLocaleDateString()}] ${user?.firstName || 'Admin'}: ${comment}`;
    
    try {
      await taskService.update(task.id, { notes: newNotes });
      setTask({ ...task, notes: newNotes });
      setComment('');
      toast.success('Comment added');

      // Optionally notify assignees
      task.employeeIds.forEach(empId => {
        notificationService.createNotification(
          `New Comment on Task: ${task.taskName}`,
          `${user?.firstName || 'Admin'} commented: "${comment}"`,
          'Task Update',
          'NORMAL',
          empId,
          'TASKS',
          task.id,
          `/workspace/tasks/${task.id}`
        );
      });
    } catch (e: any) {
      toast.error('Failed to add comment');
    }
  };

  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <PageContainer>
      <PageHeader
        title={task.taskName}
        description={`Code: ${task.taskCode} | Client: ${clientName}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Tasks', path: '/tasks' },
          { label: task.taskCode }
        ]}
        action={
          !task.isArchived && (
            <Button onClick={() => navigate(`/tasks/${task.id}/edit`)} className="flex items-center gap-2">
              <Edit size={16} /> Edit Task
            </Button>
          )
        }
      />

      {task.isArchived && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          <div>
            <h4 className="font-bold text-sm">Task Archived</h4>
            <p className="text-xs">This task is in the archive and is read-only. Restore it to make modifications.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <StatusBadge status={task.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <span className="text-sm font-bold text-gray-900">{task.priority}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <span className="text-sm font-medium text-gray-900">{task.category}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                   {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : '-'}
                </span>
              </div>
            </div>

            {task.description && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{task.description}</p>
              </div>
            )}

            {task.instructions && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Instructions</p>
                <p className="text-sm text-blue-900 whitespace-pre-wrap">{task.instructions}</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
              <MessageSquare size={18} className="text-gray-500" />
              <h3 className="text-lg font-bold text-gray-900">Comments & Notes</h3>
            </div>
            
            {task.notes ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm text-gray-700 border border-gray-200">
                {task.notes}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-6 italic">No comments yet.</p>
            )}

            {!task.isArchived && (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  className="w-full shadow-sm focus:ring-primary focus:border-primary sm:text-sm border-gray-300 rounded-md p-3 border"
                  placeholder="Type your comment or note here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button 
                  onClick={handleAddComment} 
                  disabled={!comment.trim()}
                >
                  Post Comment
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
               <h3 className="text-lg font-bold text-gray-900">Checklist</h3>
               <span className="text-sm text-gray-500 font-medium">
                  {task.checklist.filter(c => c.isCompleted).length} / {task.checklist.length} Completed
               </span>
            </div>
            
            {task.checklist.length === 0 ? (
              <p className="text-sm text-gray-500">No checklist items for this task.</p>
            ) : (
              <div className="space-y-3">
                {task.checklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors">
                    <div className="pt-0.5">
                       <input 
                         type="checkbox" 
                         checked={item.isCompleted}
                         onChange={() => handleToggleChecklist(item.id, item.isCompleted)}
                         disabled={task.isArchived}
                         className="w-5 h-5 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                       />
                    </div>
                    <span className={`flex-1 text-sm ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <TaskTeamManager 
             task={task} 
             managerName={managerName} 
             onUpdate={() => taskService.getById(task.id).then(t => t && setTask(t))} 
           />

           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Timeline</h3>
             
             <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                     <Clock size={14} />
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Created On</p>
                     <p className="text-sm font-medium text-gray-900">{format(new Date(task.createdAt), 'MMM dd, yyyy')}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                     <Calendar size={14} />
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Start Date</p>
                     <p className="text-sm font-medium text-gray-900">{task.startDate ? format(new Date(task.startDate), 'MMM dd, yyyy') : 'Not set'}</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                     <Calendar size={14} />
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Due Date</p>
                     <p className="text-sm font-medium text-gray-900">{task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'Not set'}</p>
                   </div>
                </div>
                {task.completionDate && (
                  <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                       <CheckSquare size={14} />
                     </div>
                     <div>
                       <p className="text-xs text-gray-500">Completed On</p>
                       <p className="text-sm font-medium text-gray-900">{format(new Date(task.completionDate), 'MMM dd, yyyy')}</p>
                     </div>
                  </div>
                )}
             </div>
           </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default TaskDetails;
