import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Receipt, IndianRupee, PieChart, AlertCircle, Eye, Edit, Archive, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import { Invoice, BillingStats } from '@/types/billing';
import { invoiceService, billingService } from '@/services/BillingService';
import { clientService } from '@/services/ClientService';
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

export const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, refresh } = useCrud(invoiceService, { includeArchived: true });
  const { pagination, setPagination, sorting, setSorting } = usePagination(10);
  const { searchQuery, handleSearch } = useSearch();
  const { confirm, isOpen, close, handleConfirm, config } = useConfirm();

  const [stats, setStats] = useState<BillingStats>({ 
    totalRevenue: 0, outstandingAmount: 0, paidInvoices: 0, unpaidInvoices: 0, overdueInvoices: 0, draftInvoices: 0, thisMonthRevenue: 0, thisYearRevenue: 0 
  });
  
  const [showArchived, setShowArchived] = useState(false);
  const [activeTab, setActiveTab] = useState<'INVOICE' | 'QUOTATION'>('INVOICE');
  const [clients, setClients] = useState<Record<string, string>>({});

  useEffect(() => {
    billingService.getStats().then(setStats);
    clientService.getAll().then(cls => {
      setClients(cls.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.clientName }), {}));
    });
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data.filter(d => d.type === activeTab);
    
    if (!showArchived) result = result.filter(c => !c.isArchived);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(q) || 
        (clients[inv.clientId]?.toLowerCase() || '').includes(q)
      );
    }
    
    return result.map(inv => ({
      ...inv,
      clientName: clients[inv.clientId] || 'Unknown Client'
    }));
  }, [data, searchQuery, showArchived, activeTab, clients]);

  const paginatedData = useMemo(() => {
    let result = [...filteredData];
    if (sorting.length > 0) {
      const sort = sorting[0];
      result.sort((a, b) => {
        const aVal = a[sort.id as keyof Invoice] || '';
        const bVal = b[sort.id as keyof Invoice] || '';
        if (aVal < bVal) return sort.desc ? 1 : -1;
        if (aVal > bVal) return sort.desc ? -1 : 1;
        return 0;
      });
    }
    const start = pagination.pageIndex * pagination.pageSize;
    return result.slice(start, start + pagination.pageSize);
  }, [filteredData, sorting, pagination]);

  const handleArchive = (id: string, number: string) => {
    confirm({
      title: `Archive ${activeTab === 'INVOICE' ? 'Invoice' : 'Quotation'}`,
      message: `Are you sure you want to archive ${number}?`,
      confirmText: 'Archive',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await invoiceService.archive(id);
          refresh();
        } catch (e: any) {
          toast.error(e.message || 'Failed to archive');
        }
      }
    });
  };

  const columns = useMemo<ColumnDef<Invoice>[]>(() => [
    {
      accessorKey: 'invoiceNumber',
      header: activeTab === 'INVOICE' ? 'Invoice #' : 'Quotation #',
      cell: ({ getValue }) => <span className="font-mono font-medium text-primary">{getValue() as string}</span>,
    },
    {
      accessorKey: 'clientName',
      header: 'Client',
      cell: ({ getValue }) => <span className="font-medium text-gray-900">{getValue() as string}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ getValue }) => <span className="font-semibold text-gray-900">₹{(getValue() as number).toLocaleString()}</span>,
    },
    {
      accessorKey: 'balanceAmount',
      header: 'Balance Due',
      cell: ({ row }) => {
        const balance = row.original.balanceAmount;
        return <span className={`font-semibold ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>₹{balance.toLocaleString()}</span>;
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
         const isOverdue = new Date(date) < new Date() && row.original.balanceAmount > 0 && row.original.status !== 'PAID';
         return <span className={`text-sm ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-600'}`}>{format(new Date(date), 'MMM dd, yyyy')}</span>;
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => navigate(`/billing/${inv.id}`)}
              className="p-1.5 text-gray-500 hover:text-primary transition-colors bg-gray-50 hover:bg-primary/10 rounded"
              title="View Details"
            >
              <Eye size={16} />
            </button>
            {!inv.isArchived && (
              <button 
                onClick={() => navigate(`/billing/${inv.id}/edit`)}
                className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 rounded"
              >
                <Edit size={16} />
              </button>
            )}
            {!inv.isArchived && (
              <button 
                onClick={() => handleArchive(inv.id, inv.invoiceNumber)}
                className="p-1.5 text-gray-500 hover:text-danger transition-colors bg-gray-50 hover:bg-red-50 rounded"
              >
                <Archive size={16} />
              </button>
            )}
          </div>
        );
      },
    },
  ], [confirm, refresh, navigate, activeTab]);

  return (
    <PageContainer>
      <PageHeader
        title="Billing & Invoice Management"
        description="Manage quotations, invoices, and track firm revenue."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Billing' }]}
        action={
          <div className="flex items-center gap-3">
             <Button onClick={() => navigate('/billing/quotation/new')} variant="outline" className="flex items-center gap-2">
               <FileText size={18} /> New Quotation
             </Button>
             <Button onClick={() => navigate('/billing/new')} className="flex items-center gap-2">
               <Plus size={18} /> Create Invoice
             </Button>
          </div>
        }
      />

      {/* Financial Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Outstanding Balance" 
          value={`₹${stats.outstandingAmount.toLocaleString()}`} 
          icon={AlertCircle} 
          colorVariant="danger" 
        />
        <StatsCard 
          title="This Month Revenue" 
          value={`₹${stats.thisMonthRevenue.toLocaleString()}`} 
          icon={IndianRupee} 
          colorVariant="success" 
        />
        <StatsCard 
          title="Total Revenue (YTD)" 
          value={`₹${stats.thisYearRevenue.toLocaleString()}`} 
          icon={PieChart} 
          colorVariant="primary" 
        />
        <StatsCard 
          title="Unpaid / Overdue" 
          value={`${stats.unpaidInvoices} / ${stats.overdueInvoices}`} 
          icon={Receipt} 
          colorVariant="warning" 
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
         <button 
           onClick={() => setActiveTab('INVOICE')} 
           className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'INVOICE' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
         >
           Invoices
         </button>
         <button 
           onClick={() => setActiveTab('QUOTATION')} 
           className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'QUOTATION' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
         >
           Quotations
         </button>
      </div>

      <ActionBar>
        <SearchBar onSearch={handleSearch} placeholder={`Search ${activeTab.toLowerCase()}s by Number, Client...`} />
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
        onRowClick={(row: any) => navigate(`/billing/${row.id}`)}
        emptyStateTitle={`No ${activeTab.toLowerCase()}s found`}
        emptyStateDescription={`Create a new ${activeTab.toLowerCase()} to get started.`}
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

export default InvoiceList;
