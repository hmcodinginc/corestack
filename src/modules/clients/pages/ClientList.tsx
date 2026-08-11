import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Briefcase, Building2, UserCircle, ShieldAlert, Archive, Plus, Eye, Edit, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { Client, ClientStats } from '@/types/client';
import { clientService } from '@/services/ClientService';
import { departmentService } from '@/services/DepartmentService';
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

export const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, refresh } = useCrud(clientService, { includeArchived: true });
  const { pagination, setPagination, sorting, setSorting } = usePagination(10);
  const { searchQuery, handleSearch } = useSearch();
  const { confirm, isOpen, close, handleConfirm, config } = useConfirm();

  const [stats, setStats] = useState<ClientStats>({ 
    total: 0, active: 0, inactive: 0, archived: 0, individual: 0, business: 0, recentlyAdded: 0 
  });
  const [showArchived, setShowArchived] = useState(false);
  
  // Mapping States
  const [departments, setDepartments] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Record<string, string>>({});

  useEffect(() => {
    clientService.getStats().then(setStats);
    
    // Preload relational dictionaries
    Promise.all([
      departmentService.getAll(),
      employeeService.getAll()
    ]).then(([deps, emps]) => {
      setDepartments(deps.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {}));
      setEmployees(emps.reduce((acc, curr) => ({ ...acc, [curr.id]: `${curr.firstName} ${curr.lastName}` }), {}));
    });
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    
    if (!showArchived) {
      result = result.filter(c => !c.isArchived);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.clientName.toLowerCase().includes(q) || 
        (c.companyName?.toLowerCase() || '').includes(q) ||
        c.clientCode.toLowerCase().includes(q) ||
        c.pan.toLowerCase().includes(q) ||
        (c.email?.toLowerCase() || '').includes(q)
      );
    }
    
    return result.map(c => ({
      ...c,
      departmentName: c.departmentId ? departments[c.departmentId] : 'Unassigned',
      managerName: c.managerId ? employees[c.managerId] : 'Unassigned'
    }));
  }, [data, searchQuery, showArchived, departments, employees]);

  const paginatedData = useMemo(() => {
    let result = [...filteredData];
    
    if (sorting.length > 0) {
      const sort = sorting[0];
      result.sort((a, b) => {
        const aVal = a[sort.id as keyof Client] || '';
        const bVal = b[sort.id as keyof Client] || '';
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
      title: 'Archive Client',
      message: `Are you sure you want to archive ${name}? They will no longer appear in active assignments.`,
      confirmText: 'Archive Client',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await clientService.archive(id);
          refresh();
        } catch (e: any) {
          toast.error(e.message || 'Failed to archive');
        }
      }
    });
  };

  const handleRestore = async (id: string) => {
    try {
      await clientService.restore(id);
      refresh();
      toast.success('Client restored successfully');
    } catch (e: any) {
      toast.error('Failed to restore');
    }
  };

  const columns = useMemo<ColumnDef<Client>[]>(() => [
    {
      accessorKey: 'clientCode',
      header: 'Code',
      cell: ({ getValue }) => <span className="font-semibold text-gray-700">{getValue() as string}</span>,
    },
    {
      accessorKey: 'clientName',
      header: 'Client / Company',
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{client.clientName}</span>
            {client.companyName && <span className="text-xs text-gray-500">{client.companyName}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'departmentName',
      header: 'Department & Manager',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{row.original.departmentName}</span>
          <span className="text-xs text-gray-500">{row.original.managerName}</span>
        </div>
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
      header: 'Created On',
      cell: ({ getValue }) => format(new Date(getValue() as string), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => navigate(`/clients/${client.id}`)}
              className="p-1 text-gray-500 hover:text-primary transition-colors"
              title="View Profile"
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={() => navigate(`/clients/${client.id}/edit`)}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              title="Edit Profile"
            >
              <Edit size={18} />
            </button>
            {client.isArchived ? (
              <button 
                onClick={() => handleRestore(client.id)}
                className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                title="Restore"
              >
                <RotateCcw size={18} />
              </button>
            ) : (
              <button 
                onClick={() => handleArchive(client.id, client.clientName)}
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
        title="Client Directory"
        description="Manage all your firm's clients, their business details, and team assignments."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Clients' }
        ]}
        action={
          <Button onClick={() => navigate('/clients/new')} className="flex items-center gap-2">
            <Plus size={18} /> Add Client
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Clients" value={stats.total} icon={Briefcase} colorVariant="primary" />
        <StatsCard title="Business Entities" value={stats.business} icon={Building2} colorVariant="success" />
        <StatsCard title="Individuals" value={stats.individual} icon={UserCircle} colorVariant="info" />
        <StatsCard title="Archived" value={stats.archived} icon={ShieldAlert} colorVariant="danger" />
      </div>

      <ActionBar>
        <SearchBar onSearch={handleSearch} placeholder="Search clients by Name, Company, PAN, GST..." />
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
        onRowClick={(row: any) => navigate(`/clients/${row.id}`)}
        emptyStateTitle="No clients found"
        emptyStateDescription="Start by onboarding your first client into the system."
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

export default ClientList;
