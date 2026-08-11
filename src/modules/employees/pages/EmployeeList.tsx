import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Users, UserPlus, UserMinus, ShieldAlert, Archive, Plus, Eye, Edit, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { Employee, EmployeeStats } from '@/types/employee';
import { employeeService } from '@/services/EmployeeService';
import { departmentService } from '@/services/DepartmentService';
import { roleService } from '@/services/RoleService';
import { designationService } from '@/services/DesignationService';
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

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, refresh } = useCrud(employeeService, { includeArchived: true });
  const { pagination, setPagination, sorting, setSorting } = usePagination(10);
  const { searchQuery, handleSearch } = useSearch();
  const { confirm, isOpen, close, handleConfirm, config } = useConfirm();

  const [stats, setStats] = useState<EmployeeStats>({ total: 0, active: 0, inactive: 0, archived: 0, newThisMonth: 0 });
  const [showArchived, setShowArchived] = useState(false);
  
  // Mapping States
  const [departments, setDepartments] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [designations, setDesignations] = useState<Record<string, string>>({});

  useEffect(() => {
    employeeService.getStats().then(setStats);
    
    // Preload relational dictionaries
    Promise.all([
      departmentService.getAll(),
      roleService.getAll(),
      designationService.getAll()
    ]).then(([deps, rls, desigs]) => {
      setDepartments(deps.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {}));
      setRoles(rls.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {}));
      setDesignations(desigs.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {}));
    });
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    
    if (!showArchived) {
      result = result.filter(e => !e.isArchived);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.firstName.toLowerCase().includes(q) || 
        e.lastName.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.mobile.includes(q)
      );
    }
    
    return result.map(e => ({
      ...e,
      departmentName: departments[e.departmentId] || 'Unknown',
      roleName: roles[e.roleId] || 'Unknown',
      designationName: designations[e.designationId] || 'Unknown'
    }));
  }, [data, searchQuery, showArchived, departments, roles, designations]);

  const paginatedData = useMemo(() => {
    let result = [...filteredData];
    
    if (sorting.length > 0) {
      const sort = sorting[0];
      result.sort((a, b) => {
        const aVal = a[sort.id as keyof Employee] || '';
        const bVal = b[sort.id as keyof Employee] || '';
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
      title: 'Archive Employee',
      message: `Are you sure you want to archive ${name}? This will revoke their access to the system.`,
      confirmText: 'Archive Employee',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await employeeService.archive(id);
          refresh();
        } catch (e: any) {
          toast.error(e.message || 'Failed to archive');
        }
      }
    });
  };

  const handleRestore = async (id: string) => {
    try {
      await employeeService.restore(id);
      refresh();
      toast.success('Employee restored successfully');
    } catch (e: any) {
      toast.error('Failed to restore');
    }
  };

  const columns = useMemo<ColumnDef<Employee>[]>(() => [
    {
      accessorKey: 'firstName', // Sorts by first name
      header: 'Employee',
      cell: ({ row }) => {
        const emp = row.original;
        const initial = emp.firstName.charAt(0) + emp.lastName.charAt(0);
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {initial}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</span>
              <span className="text-xs text-gray-500">{emp.employeeId}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'departmentName',
      header: 'Department & Role',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{row.original.departmentName}</span>
          <span className="text-xs text-gray-500">{row.original.roleName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'designationName',
      header: 'Designation',
      cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue() as string}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.isArchived ? 'ARCHIVED' : row.original.status} />
      ),
    },
    {
      accessorKey: 'joiningDate',
      header: 'Joining Date',
      cell: ({ getValue }) => format(new Date(getValue() as string), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => navigate(`/employees/${emp.id}`)}
              className="p-1 text-gray-500 hover:text-primary transition-colors"
              title="View Profile"
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={() => navigate(`/employees/${emp.id}/edit`)}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
              title="Edit Profile"
            >
              <Edit size={18} />
            </button>
            {emp.isArchived ? (
              <button 
                onClick={() => handleRestore(emp.id)}
                className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                title="Restore"
              >
                <RotateCcw size={18} />
              </button>
            ) : (
              <button 
                onClick={() => handleArchive(emp.id, `${emp.firstName} ${emp.lastName}`)}
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
        title="Employee Directory"
        description="Manage your workforce, update profiles, and assign organizational roles."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Employees' }
        ]}
        action={
          <Button onClick={() => navigate('/employees/new')} className="flex items-center gap-2">
            <Plus size={18} /> Onboard Employee
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Employees" value={stats.total} icon={Users} colorVariant="primary" />
        <StatsCard title="Active" value={stats.active} icon={UserPlus} colorVariant="success" />
        <StatsCard title="Inactive/Pending" value={stats.inactive} icon={UserMinus} colorVariant="warning" />
        <StatsCard title="Archived" value={stats.archived} icon={ShieldAlert} colorVariant="danger" />
      </div>

      <ActionBar>
        <SearchBar onSearch={handleSearch} placeholder="Search employees by name, ID, email, phone..." />
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
        onRowClick={(row: any) => navigate(`/employees/${row.id}`)}
        emptyStateTitle="No employees found"
        emptyStateDescription="Start by onboarding your first team member."
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

export default EmployeeList;
