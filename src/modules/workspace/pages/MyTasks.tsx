import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { taskService } from '@/services/TaskService';

export const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (user?.id) {
          const fetchedTasks = await taskService.getByEmployee(user.id);
          setTasks(fetchedTasks);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const columns = [
    { accessorKey: 'taskName', header: 'Title' },
    { accessorKey: 'clientName', header: 'Client' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'dueDate', header: 'Due Date' }
  ];

  const handleRowClick = (task: any) => {
    navigate(`/workspace/tasks/${task.id}`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="My Tasks"
        description="Manage your assigned tasks"
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <DataTable
          columns={columns}
          data={tasks}
          loading={loading}
          onRowClick={handleRowClick}
          pagination={pagination}
          setPagination={setPagination}
          totalItems={tasks.length}
        />
      </div>
    </PageContainer>
  );
};

export default MyTasks;
