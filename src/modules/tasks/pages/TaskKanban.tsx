import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MessageSquare, Paperclip, MoreHorizontal, User, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { AppTask, TaskStatus } from '@/types/task';
import { taskService } from '@/services/TaskService';

interface TaskKanbanProps {
  data: (AppTask & { clientName: string, assignedNames: string })[];
  onRefresh: () => void;
}

const COLUMNS: { id: TaskStatus, title: string, color: string }[] = [
  { id: 'PENDING', title: 'Pending', color: 'bg-gray-100 border-gray-200' },
  { id: 'ASSIGNED', title: 'Assigned', color: 'bg-blue-50 border-blue-200' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-indigo-50 border-indigo-200' },
  { id: 'UNDER_REVIEW', title: 'Review', color: 'bg-orange-50 border-orange-200' },
  { id: 'COMPLETED', title: 'Completed', color: 'bg-green-50 border-green-200' },
];

export const TaskKanban: React.FC<TaskKanbanProps> = ({ data, onRefresh }) => {
  const navigate = useNavigate();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow drag image to generate before adding opacity
    setTimeout(() => {
       const el = document.getElementById(`task-${taskId}`);
       if (el) el.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(null);
    const el = document.getElementById(`task-${taskId}`);
    if (el) el.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = data.find(t => t.id === draggedTaskId);
    if (!task) return;

    if (task.status === status) return; // No change

    if (task.isArchived) {
       toast.error('Cannot move archived tasks');
       return;
    }

    try {
      await taskService.update(draggedTaskId, { status });
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task status');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-320px)] min-h-[500px]">
      {COLUMNS.map(column => {
        const columnTasks = data.filter(t => t.status === column.id);
        
        return (
          <div 
            key={column.id} 
            className={`flex-shrink-0 w-80 rounded-xl border ${column.color} flex flex-col`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="p-4 border-b border-black/5 flex items-center justify-between bg-black/5 rounded-t-xl">
              <h3 className="font-bold text-gray-800">{column.title}</h3>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
              {columnTasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
                const completedChecklist = task.checklist?.filter(c => c.isCompleted).length || 0;
                const totalChecklist = task.checklist?.length || 0;

                return (
                  <div
                    id={`task-${task.id}`}
                    key={task.id}
                    draggable={!task.isArchived}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={(e) => handleDragEnd(e, task.id)}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-primary hover:shadow-md transition-all active:cursor-grabbing group relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                         {task.priority}
                       </span>
                       <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                         <MoreHorizontal size={16} />
                       </button>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{task.taskName}</h4>
                    <p className="text-xs font-medium text-gray-500 mb-4">{task.clientName}</p>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        {totalChecklist > 0 && (
                          <div className={`flex items-center gap-1 text-xs ${completedChecklist === totalChecklist ? 'text-green-600 font-medium' : 'text-gray-500'}`} title="Checklist Progress">
                            <CheckSquare size={14} /> {completedChecklist}/{totalChecklist}
                          </div>
                        )}
                      </div>
                      
                      {task.dueDate && (
                        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                          <Clock size={14} /> {format(new Date(task.dueDate), 'MMM dd')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {columnTasks.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
