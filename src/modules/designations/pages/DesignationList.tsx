import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Award, ShieldAlert, Archive, Plus, Eye, Edit, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { Designation, DesignationStats } from '@/types/designation';
import { designationService } from '@/services/DesignationService';
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

export const DesignationList: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, refresh } = useCrud(designationService, { includeArchived: true });
  const { pagination, setPagination, sorting, setSorting } = usePagination(10);
  const { searchQuery, handleSearch } = useSearch();
  const { confirm, isOpen, close, handleConfirm, config } = useConfirm();

  const [stats, setStats] = useState<DesignationStats>({ total: 0, active: 0, archived: 0 });
  const [showArchived, setShowArchived] = useState(false);
  const [departments, setDepartments] = useState<Record<string, string>>({});

  useEffect(() => {
    designationService.getStats().then(setStats);
    departmentService.getAll().then(deps => {
      const depMap = deps.reduce((acc, curr) => {
        acc[curr.id] = curr.name;
        return acc;
      }, {} as Record<string, string>);
      setDepartments(depMap);
    });
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    
    if (!showArchived) {
      result = result.filter(d => !d.isArchived);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.code.toLowerCase().includes(q)
      );
    }
    
    // Inject department names
    return result.map(d => ({
      ...d,
      departmentName: d.departmentId ? departments[d.departmentId] : 'Global'
    }));
  }, [data, searchQuery, showArchived, departments]);

  const paginatedData = useMemo(() => {
    let result = [...filteredData];
    
    if (sorting.length > 0) {
      const sort = sorting[0];
      result.sort((a, b) => {
        const aVal = a[sort.id as keyof Designation] || '';
        const bVal = b[sort.id as keyof Designation] || '';
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
      title: 'Archive Designation',
      message: `Are you sure you want to archive the ${name} designation? This will prevent it from being assigned to new employees.`,
      confirmText: 'Archive Designation',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await designationService.archive(id);
          refresh();
        } catch (e: any) {
          toast.error(e.message || 'Failed to archive');
        }
      }
    });
  };

  const handleRestore = async (id: string) => {
    try {
      await designationService.restore(id);
      refresh();
      toast.success('Designation restored successfully');
    } catch (e: any) {
      toast.error('Failed to restore');
    }
  };

  const columns = useMemo<ColumnDef<Designation>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Designation',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.original.name}</span>
          <span className="text-xs text-gray-500">{row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: 'departmentName',
      header: 'Department',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-700">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'hierarchyLevel',
      header: 'Hierarchy',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-purple-800 bg-purple-100 rounded-full">
          Level {getValue() as number}
        </span>
      ),
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
        const designation = row.original;
        
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => navigate(`/designations/${designation.id}`)}
              className="p-1 text-gray-500 hover:text-primary transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={() => navigate(`/designations/${designation.id}/edit`)}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            {designation.isArchived ? (
              <button 
                onClick={() => handleRestore(designation.id)}
                className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                title="Restore"
              >
                <RotateCcw size={18} />
              </button>
            ) : (
              <button 
                onClick={() => handleArchive(designation.id, designation.name)}
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
        title="Designation Management"
        description="Configure job titles, structural hierarchies, and reporting levels."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Designations' }
        ]}
        action={
          <Button onClick={() => navigate('/designations/new')} className="flex items-center gap-2">
            <Plus size={18} /> Add Designation
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Designations" value={stats.total} icon={Award} colorVariant="primary" />
        <StatsCard title="Active Designations" value={stats.active} icon={Award} colorVariant="success" />
        <StatsCard title="Archived" value={stats.archived} icon={ShieldAlert} colorVariant="warning" />
      </div>

      <ActionBar>
        <SearchBar onSearch={handleSearch} placeholder="Search designations by name or code..." />
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
        onRowClick={(row: any) => navigate(`/designations/${row.id}`)}
        emptyStateTitle="No designations found"
        emptyStateDescription="Get started by defining a new job title."
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

export default DesignationList;
