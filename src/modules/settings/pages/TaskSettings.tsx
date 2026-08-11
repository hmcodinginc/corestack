import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { settingsService } from '@/services/SettingsService';
import { TaskWorkflowSettings } from '@/types/settings';
import { toast } from 'react-hot-toast';
import { CheckSquare, Save } from 'lucide-react';

export const TaskSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<TaskWorkflowSettings>();

  useEffect(() => {
    const settings = settingsService.getSettings();
    reset(settings.tasks);
    setLoading(false);
  }, [reset]);

  const onSubmit = async (data: TaskWorkflowSettings) => {
    await settingsService.updateSettings('tasks', data);
    reset(data);
    toast.success('Task settings saved');
  };

  if (loading) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare size={20} className="text-primary" /> Task & Workflow Settings
          </h2>
          <p className="text-sm text-gray-500">Set up assignment rules and task enforcement.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty} className="flex items-center gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <form className="space-y-6 max-w-2xl" onSubmit={handleSubmit(onSubmit)}>
        
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Task Creation Defaults</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Priority</label>
              <select {...register('defaultTaskPriority')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary">
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status</label>
              <select {...register('defaultTaskStatus')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary">
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Due Date (+ Days)</label>
              <input type="number" {...register('defaultDueDays', { valueAsNumber: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Workflow Rules</h3>
          
          <label className="flex items-start gap-3">
            <input type="checkbox" {...register('allowMultipleAssignees')} className="mt-1 w-4 h-4 text-primary rounded" />
            <div>
              <p className="text-sm font-bold text-gray-900">Multiple Assignees</p>
              <p className="text-xs text-gray-500">Allow a single task to be assigned to multiple employees simultaneously.</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3">
            <input type="checkbox" {...register('requireChecklist')} className="mt-1 w-4 h-4 text-primary rounded" />
            <div>
              <p className="text-sm font-bold text-gray-900">Enforce Checklists</p>
              <p className="text-xs text-gray-500">Prevent task completion unless all checklist items are ticked off.</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3">
            <input type="checkbox" {...register('requireTaskApproval')} className="mt-1 w-4 h-4 text-primary rounded" />
            <div>
              <p className="text-sm font-bold text-gray-900">Require Approval (Under Review)</p>
              <p className="text-xs text-gray-500">Employees cannot mark tasks as completed; they must be sent for review.</p>
            </div>
          </label>
          
          <label className="flex items-start gap-3">
            <input type="checkbox" {...register('overdueTaskReminder')} className="mt-1 w-4 h-4 text-primary rounded" />
            <div>
              <p className="text-sm font-bold text-gray-900">Overdue Reminders</p>
              <p className="text-xs text-gray-500">Trigger daily notifications for overdue tasks.</p>
            </div>
          </label>
        </div>

      </form>
    </div>
  );
};

export default TaskSettings;
