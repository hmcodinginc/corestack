import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { taskService } from '@/services/TaskService';
import { notificationService } from '@/services/NotificationService';
import { useAuth } from '@/context/AuthContext';
import { AppTask } from '@/types/task';

export const WorkspaceTaskDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<AppTask | null>(null);
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadTask = async () => {
      if (id && user) {
        const data = await taskService.getById(id);
        if (data) {
          const isAuthorized = data.employeeIds.includes(user.id) || data.managerId === user.id;
          if (isAuthorized) {
            setTask(data);
            setStatus(data.status);
          } else {
            navigate('/unauthorized');
            return;
          }
        } else {
          navigate('/workspace/tasks');
          return;
        }
      }
      setLoading(false);
    };
    loadTask();
  }, [id, user, navigate]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as any;
    setStatus(newStatus);
    if (id) {
      await taskService.update(id, { status: newStatus });
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !id || !task) return;
    
    // Add to notes
    const newNotes = task.notes ? `${task.notes}\n[${new Date().toLocaleDateString()}] ${user?.firstName}: ${comment}` : `[${new Date().toLocaleDateString()}] ${user?.firstName}: ${comment}`;
    await taskService.update(id, { notes: newNotes });
    
    // Notify admin
    await notificationService.createNotification(
      `Task Comment: ${task.taskName}`,
      `${user?.firstName} ${user?.lastName} commented: "${comment}"`,
      'New Task Comment',
      'NORMAL',
      '1', // Admin ID
      'TASKS',
      id,
      `/tasks/${id}`
    );
    
    setTask({ ...task, notes: newNotes });
    setComment('');
  };

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;
  if (!task) return <PageContainer><p>Task not found.</p></PageContainer>;

  return (
    <PageContainer>
      <div className="mb-4">
        <button 
          onClick={() => navigate('/workspace/tasks')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to My Tasks
        </button>
      </div>
      
      <PageHeader
        title={`Task: ${task.taskName}`}
        description={`Client: ${task.clientName || 'N/A'}`}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium">Status Update</h3>
          <div className="mt-2">
            <select 
              value={status}
              onChange={handleStatusChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {task.notes && (
          <div>
            <h3 className="text-lg font-medium">Previous Comments</h3>
            <div className="mt-2 p-4 bg-gray-50 rounded-md whitespace-pre-wrap text-sm text-gray-700 border border-gray-200">
              {task.notes}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium">Comments</h3>
          <div className="mt-2 space-y-2">
            <textarea
              rows={3}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              onClick={handleAddComment}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default WorkspaceTaskDetails;
