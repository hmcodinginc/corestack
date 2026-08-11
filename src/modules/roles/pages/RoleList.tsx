import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Shield, ShieldAlert, Archive, Plus, Eye, Edit, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { Role, RoleStats } from '@/types/role';
import { roleService } from '@/services/RoleService';
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

export const RoleList: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, refresh } = useCrud(roleService, { includeArchived: true });
  const { pagination, setPagination, sorting, setSorting } = usePagination(10);
  const { searchQuery, handleSearch } = useSearch();
  const { confirm, isOpen, close, handleConfirm, config } = useConfirm();

  const [stats, setStats] = useState<RoleStats>({ total: 0, active: 0, archived: 0 });
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    roleService.getStats().then(setStats);
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    
    // Filter by Archive Status
    if (!showArchived) {
      result = result.filter(r => !r.isArchived);
    }

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.code.toLowerCase().includes(q)
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
        const aVal = a[sort.id as keyof Role] || '';
        const bVal = b[sort.id as keyof Role] || '';
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
      title: 'Archive Role',
      message: `Are you sure you want to archive the ${name} role? Users with this role may lose access to critical modules.`,
      confirmText: 'Archive Role',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await roleService.archive(id);
          refresh();
        } catch (e: any) {
          toast.error(e.message || 'Failed to archive');
        }
      }
    });
  };

  const handleRestore = async (id: string) => {
    try {
      await roleService.restore(id);
      refresh();
      toast.success('Role restored successfully');
    } catch (e: any) {
      toast.error('Failed to restore');
    }
  };

  const columns = useMemo<ColumnDef<Role>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.original.name}</span>
          <span className="text-xs text-gray-500">{row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: 'hierarchyLevel',
      header: 'Hierarchy Level',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full">
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
        const role = row.original;
        const isSuperAdmin = role.hierarchyLevel === 1 || role.code === 'SA';
        
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => navigate(`/roles/${role.id}`)}
              className="p-1 text-gray-500 hover:text-primary transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={() => navigate(`/roles/${role.id}/edit`)}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              title="Edit Permissions"
            >
              <Edit size={18} />
            </button>
            {!isSuperAdmin && (
              role.isArchived ? (
                <button 
                  onClick={() => handleRestore(role.id)}
                  className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                  title="Restore"
                >
                  <RotateCcw size={18} />
                </button>
              ) : (
                <button 
                  onClick={() => handleArchive(role.id, role.name)}
                  className="p-1 text-gray-500 hover:text-danger transition-colors"
                  title="Archive"
                >
                  <Archive size={18} />
                </button>
              )
            )}
          </div>
        );
      },
    },
  ], [navigate, confirm, refresh]);

  return (
    <PageContainer>
      <PageHeader
        title="Role & Permission Management"
        description="Configure hierarchical roles and strict module-level access permissions."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Roles & Permissions' }
        ]}
        action={
          <Button onClick={() => navigate('/roles/new')} className="flex items-center gap-2">
            <Plus size={18} /> Create Role
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Roles" value={stats.total} icon={Shield} colorVariant="primary" />
        <StatsCard title="Active Roles" value={stats.active} icon={Shield} colorVariant="success" />
        <StatsCard title="Archived" value={stats.archived} icon={ShieldAlert} colorVariant="warning" />
      </div>

      <ActionBar>
        <SearchBar onSearch={handleSearch} placeholder="Search roles by name or code..." />
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
        onRowClick={(row: any) => navigate(`/roles/${row.id}`)}
        emptyStateTitle="No roles found"
        emptyStateDescription="Get started by defining a new access role."
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

export default RoleList;
