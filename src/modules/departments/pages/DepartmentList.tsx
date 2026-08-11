import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, Users, Archive, Plus, Eye, Edit, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { Department, DepartmentStats } from '@/types/department';
import { departmentService } from '@/services/DepartmentService';
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

export const DepartmentList: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, refresh } = useCrud(departmentService, { includeArchived: true });
  const { pagination, setPagination, sorting, setSorting } = usePagination(10);
  const { searchQuery, handleSearch } = useSearch();
  const { confirm, isOpen, close, handleConfirm, config } = useConfirm();

  const [stats, setStats] = useState<DepartmentStats>({ total: 0, active: 0, archived: 0 });
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    departmentService.getStats().then(setStats);
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    
    // Filter by Archive Status
    if (!showArchived) {
      result = result.filter(d => !d.isArchived);
    }

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.code.toLowerCase().includes(q) ||
        (d.head && d.head.toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [data, searchQuery, showArchived]);

  // Apply sorting and pagination manually since we are mocking a backend
  const paginatedData = useMemo(() => {
    let result = [...filteredData];
    
    if (sorting.length > 0) {
      const sort = sorting[0];
      result.sort((a, b) => {
        const aVal = a[sort.id as keyof Department] || '';
        const bVal = b[sort.id as keyof Department] || '';
        if (aVal < bVal) return sort.desc ? 1 : -1;
        if (aVal > bVal) return sort.desc ? -1 : 1;
        return 0;
      });
    }
    
    const start = pagination.pageIndex * pagination.pageSize;
    return result.slice(start, start + pagination.pageSize);
  }, [filteredData, sorting, pagination]);

  const handleArchive = (id: string) => {
    confirm({
      title: 'Archive Department',
      message: 'Are you sure you want to archive this department? It will no longer be available for new employee assignments.',
      confirmText: 'Archive',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await departmentService.archive(id);
          refresh();
        } catch (e: any) {
          toast.error(e.message || 'Failed to archive');
        }
      }
    });
  };

  const handleRestore = async (id: string) => {
    try {
      await departmentService.restore(id);
      refresh();
      toast.success('Department restored successfully');
    } catch (e: any) {
      toast.error('Failed to restore');
    }
  };

  const columns = useMemo<ColumnDef<Department>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Department',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.original.name}</span>
          <span className="text-xs text-gray-500">{row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: 'head',
      header: 'Department Head',
      cell: ({ getValue }) => getValue() || <span className="text-gray-400 italic">Not Assigned</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.isArchived ? 'ARCHIVED' : row.original.status} />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ getValue }) => format(new Date(getValue() as string), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => navigate(`/departments/${dept.id}`)}
              className="p-1 text-gray-500 hover:text-primary transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={() => navigate(`/departments/${dept.id}/edit`)}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            {dept.isArchived ? (
              <button 
                onClick={() => handleRestore(dept.id)}
                className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                title="Restore"
              >
                <RotateCcw size={18} />
              </button>
            ) : (
              <button 
                onClick={() => handleArchive(dept.id)}
                className="p-1 text-gray-500 hover:text-danger transition-colors"
                title="Archive"
              >
                <Archive size={18} />
              </button>
            )}
          </div>
        );
      },
    },
  ], [navigate, confirm, refresh]);

  return (
    <PageContainer>
      <PageHeader
        title="Departments"
        description="Manage company departments, structural hierarchy, and functional units."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Departments' }
        ]}
        action={
          <Button onClick={() => navigate('/departments/new')} className="flex items-center gap-2">
            <Plus size={18} /> Add Department
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Departments" value={stats.total} icon={Building2} colorVariant="primary" />
        <StatsCard title="Active Departments" value={stats.active} icon={Users} colorVariant="success" />
        <StatsCard title="Archived" value={stats.archived} icon={Archive} colorVariant="warning" />
      </div>

      <ActionBar>
        <SearchBar onSearch={handleSearch} placeholder="Search departments by name, code, or head..." />
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

      <DataTable
        columns={columns}
        data={paginatedData}
        loading={loading}
        totalItems={filteredData.length}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        onRowClick={(row: any) => navigate(`/departments/${row.id}`)}
        emptyStateTitle="No departments found"
        emptyStateDescription="Get started by adding a new department to your organization."
      />

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

export default DepartmentList;
