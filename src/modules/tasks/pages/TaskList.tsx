import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { CheckSquare, Calendar, Clock, AlertCircle, Eye, Edit, Archive, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { AppTask, TaskStats } from '@/types/task';
import { taskService } from '@/services/TaskService';
import { clientService } from '@/services/ClientService';
import { employeeService } from '@/services/EmployeeService';
import { useCrud } from '@/hooks/useCrud';
import { usePagination } from '@/hooks/usePagination';
import { useSearch } from '@/hooks/useSearch';
import { useConfirm } from '@/hooks/useConfirm';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/layout/StatsCard';
import { ActionBar } from '@/components/layout/ActionBar';
import { SearchBar } from '@/components/layout/SearchBar';
import { FilterBar } from '@/components/layout/FilterBar';
import { DataTable } from '@/components/table/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { TaskKanban } from './TaskKanban';

export const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, refresh } = useCrud(taskService, { includeArchived: true });
  const { pagination, setPagination, sorting, setSorting } = usePagination(10);
  const { searchQuery, handleSearch } = useSearch();
  const { confirm, isOpen, close, handleConfirm, config } = useConfirm();

  const [stats, setStats] = useState<TaskStats>({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0, highPriority: 0, dueToday: 0 });
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  
  const [clients, setClients] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Record<string, string>>({});

  useEffect(() => {
    taskService.getStats().then(setStats);
    
    Promise.all([clientService.getAll(), employeeService.getAll()]).then(([cls, emps]) => {
      setClients(cls.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.clientName }), {}));
      setEmployees(emps.reduce((acc, curr) => ({ ...acc, [curr.id]: `${curr.firstName} ${curr.lastName}` }), {}));
    });
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    if (!showArchived) result = result.filter(c => !c.isArchived);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.taskName.toLowerCase().includes(q) || 
        t.taskCode.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (clients[t.clientId]?.toLowerCase() || '').includes(q)
      );
    }
    
    return result.map(t => ({
      ...t,
      clientName: clients[t.clientId] || 'Unknown Client',
      assignedNames: t.employeeIds.map(id => employees[id]).filter(Boolean).join(', ') || 'Unassigned'
    }));
  }, [data, searchQuery, showArchived, clients, employees]);

  const paginatedData = useMemo(() => {
    let result = [...filteredData];
    if (sorting.length > 0) {
      const sort = sorting[0];
      result.sort((a, b) => {
        const aVal = a[sort.id as keyof AppTask] || '';
        const bVal = b[sort.id as keyof AppTask] || '';
        if (aVal < bVal) return sort.desc ? 1 : -1;
        if (aVal > bVal) return sort.desc ? -1 : 1;
        return 0;
      });
    }
    const start = pagination.pageIndex * pagination.pageSize;
    return result.slice(start, start + pagination.pageSize);
  }, [filteredData, sorting, pagination]);

  const handleArchive = (id: string, name: string) => {
    confirm({
      title: 'Archive Task',
      message: `Are you sure you want to archive ${name}?`,
      confirmText: 'Archive',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await taskService.archive(id);
          refresh();
        } catch (e: any) {
          toast.error(e.message || 'Failed to archive');
        }
      }
    });
  };

  const columns = useMemo<ColumnDef<AppTask>[]>(() => [
    {
      accessorKey: 'taskCode',
      header: 'Task ID',
      cell: ({ getValue }) => <span className="font-mono text-sm">{getValue() as string}</span>,
    },
    {
      accessorKey: 'taskName',
      header: 'Task Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.original.taskName}</span>
          <span className="text-xs text-gray-500">{row.original.category}</span>
        </div>
      ),
    },
    {
      accessorKey: 'clientName',
      header: 'Client',
      cell: ({ getValue }) => <span className="text-sm font-medium text-gray-900">{getValue() as string}</span>,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        const colors = { LOW: 'bg-gray-100 text-gray-700', MEDIUM: 'bg-blue-100 text-blue-700', HIGH: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-red-100 text-red-700 font-bold' };
        return <span className={`px-2 py-1 rounded text-xs ${(colors as any)[val] || colors.LOW}`}>{val}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.isArchived ? 'ARCHIVED' : row.original.status} />,
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
         const date = row.original.dueDate;
         if (!date) return '-';
         const isOverdue = new Date(date) < new Date() && row.original.status !== 'COMPLETED';
         return <span className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{format(new Date(date), 'MMM dd, yyyy')}</span>;
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="p-1.5 text-gray-500 hover:text-primary transition-colors bg-gray-50 hover:bg-primary/10 rounded"
            >
              <Eye size={16} />
            </button>
            {!task.isArchived && (
              <button 
                onClick={() => navigate(`/tasks/${task.id}/edit`)}
                className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 rounded"
              >
                <Edit size={16} />
              </button>
            )}
            {!task.isArchived && (
              <button 
                onClick={() => handleArchive(task.id, task.taskName)}
                className="p-1.5 text-gray-500 hover:text-danger transition-colors bg-gray-50 hover:bg-red-50 rounded"
              >
                <Archive size={16} />
              </button>
            )}
          </div>
        );
      },
    },
  ], [confirm, refresh, navigate]);

  return (
    <PageContainer>
      <PageHeader
        title="Task & Workflow Management"
        description="Track assignments, monitor progress, and deliver client work on time."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Tasks' }]}
        action={
          <div className="flex items-center gap-3">
             <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                   <List size={16} /> List
                </button>
                <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
                   <LayoutGrid size={16} /> Board
                </button>
             </div>
             <Button onClick={() => navigate('/tasks/new')}>Create Task</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard title="Total Tasks" value={stats.total} icon={CheckSquare} colorVariant="primary" />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} colorVariant="warning" />
        <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} colorVariant="info" />
        <StatsCard title="Completed" value={stats.completed} icon={CheckSquare} colorVariant="success" />
        <StatsCard title="Overdue" value={stats.overdue} icon={AlertCircle} colorVariant="danger" />
        <StatsCard title="Due Today" value={stats.dueToday} icon={Calendar} colorVariant="warning" />
      </div>

      <ActionBar>
        <SearchBar onSearch={handleSearch} placeholder="Search tasks by Name, Code, Client..." />
        <FilterBar hasActiveFilters={showArchived} onClear={() => setShowArchived(false)}>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="showArchived" 
              checked={showArchived} 
              onChange={(e) => setShowArchived(e.target.checked)} 
              className="rounded border-gray-300 text-primary focus:ring-primary/20"
            />
            <label htmlFor="showArchived" className="text-sm text-gray-700 cursor-pointer">Show Archived</label>
          </div>
        </FilterBar>
      </ActionBar>

      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={paginatedData}
          loading={loading}
          totalItems={filteredData.length}
          pagination={pagination}
          setPagination={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          onRowClick={(row: any) => navigate(`/tasks/${row.id}`)}
          emptyStateTitle="No tasks found"
          emptyStateDescription="Create a task to assign work to your team."
        />
      ) : (
        <TaskKanban data={filteredData} onRefresh={refresh} />
      )}

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={close}
        onConfirm={handleConfirm}
        title={config?.title || ''}
        message={config?.message || ''}
        confirmText={config?.confirmText}
        isDestructive={config?.isDestructive}
      />
    </PageContainer>
  );
};

export default TaskList;
