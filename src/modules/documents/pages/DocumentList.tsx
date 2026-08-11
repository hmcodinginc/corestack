import React, { useMemo, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FileText, File, FolderOpen, Calendar, Clock, Archive, Download, Eye, Plus, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { downloadDummyFile } from '@/utils/downloadUtils';

import { AppDocument, DocumentStats } from '@/types/document';
import { documentService } from '@/services/DocumentService';
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
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';

export const DocumentList: React.FC = () => {
  const { data, loading, refresh } = useCrud(documentService, { includeArchived: true });
  const { pagination, setPagination, sorting, setSorting } = usePagination(10);
  const { searchQuery, handleSearch } = useSearch();
  const { confirm, isOpen, close, handleConfirm, config } = useConfirm();

  const [stats, setStats] = useState<DocumentStats>({ 
    total: 0, uploadedToday: 0, pending: 0, archived: 0, missing: 0, byCategory: {} 
  });
  const [showArchived, setShowArchived] = useState(false);
  
  const [clients, setClients] = useState<Record<string, string>>({});
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | undefined>();
  const [previewDocId, setPreviewDocId] = useState<string | undefined>();

  useEffect(() => {
    documentService.getStats().then(setStats);
    
    clientService.getAll().then(cls => {
      setClients(cls.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.clientName }), {}));
    });
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    
    if (!showArchived) {
      result = result.filter(c => !c.isArchived);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.documentName.toLowerCase().includes(q) || 
        d.documentNumber.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (clients[d.clientId]?.toLowerCase() || '').includes(q)
      );
    }
    
    return result.map(d => ({
      ...d,
      clientName: clients[d.clientId] || 'Unknown Client'
    }));
  }, [data, searchQuery, showArchived, clients]);

  const paginatedData = useMemo(() => {
    let result = [...filteredData];
    
    if (sorting.length > 0) {
      const sort = sorting[0];
      result.sort((a, b) => {
        const aVal = a[sort.id as keyof AppDocument] || '';
        const bVal = b[sort.id as keyof AppDocument] || '';
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
      title: 'Archive Document',
      message: `Are you sure you want to archive ${name}?`,
      confirmText: 'Archive',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await documentService.archive(id);
          refresh();
        } catch (e: any) {
          toast.error(e.message || 'Failed to archive');
        }
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = useMemo<ColumnDef<AppDocument>[]>(() => [
    {
      accessorKey: 'documentName',
      header: 'Document Name',
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
               <FileText size={16} />
             </div>
             <div className="flex flex-col">
               <span className="font-medium text-gray-900 truncate max-w-[200px]" title={doc.documentName}>{doc.documentName}</span>
               <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-mono">{doc.documentNumber}</span>
                  <span>•</span>
                  <span>v{doc.version}.0</span>
               </div>
             </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'clientName',
      header: 'Client & Category',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{row.original.clientName}</span>
          <span className="text-xs text-gray-500">{row.original.category}</span>
        </div>
      ),
    },
    {
      accessorKey: 'fileSize',
      header: 'File Info',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">{formatFileSize(row.original.fileSize)}</span>
          <span className="text-xs text-gray-500 uppercase">{row.original.fileType?.split('/')[1] || 'PDF'}</span>
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
      header: 'Upload Date',
      cell: ({ getValue }) => format(new Date(getValue() as string), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewDocId(doc.id)}
              className="p-1.5 text-gray-500 hover:text-primary transition-colors bg-gray-50 hover:bg-primary/10 rounded"
              title="Preview"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={() => {
                downloadDummyFile(doc.documentName || 'document.txt');
                toast.success('Download started');
              }}
              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 rounded"
              title="Download"
            >
              <Download size={16} />
            </button>
            {!doc.isArchived && (
              <button 
                onClick={() => { setEditingDocId(doc.id); setIsUploadModalOpen(true); }}
                className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50 hover:bg-indigo-50 rounded"
                title="Update Version"
              >
                <Edit size={16} />
              </button>
            )}
            {!doc.isArchived && (
              <button 
                onClick={() => handleArchive(doc.id, doc.documentName)}
                className="p-1.5 text-gray-500 hover:text-danger transition-colors bg-gray-50 hover:bg-red-50 rounded"
                title="Archive"
              >
                <Archive size={16} />
              </button>
            )}
          </div>
        );
      },
    },
  ], [confirm, refresh]);

  return (
    <PageContainer>
      <PageHeader
        title="Document Management"
        description="Securely store, version, and manage all client-related files and records."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Documents' }
        ]}
        action={
          <Button onClick={() => { setEditingDocId(undefined); setIsUploadModalOpen(true); }} className="flex items-center gap-2">
            <Plus size={18} /> Upload Document
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Files" value={stats.total} icon={FolderOpen} colorVariant="primary" />
        <StatsCard title="Uploaded Today" value={stats.uploadedToday} icon={Calendar} colorVariant="success" />
        <StatsCard title="Pending Review" value={stats.pending} icon={Clock} colorVariant="warning" />
        <StatsCard title="Missing Specs" value={stats.missing} icon={File} colorVariant="danger" />
      </div>

      <ActionBar>
        <SearchBar onSearch={handleSearch} placeholder="Search documents by Name, ID, Client..." />
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
        onRowClick={(row: any) => { setEditingDocId(row.id); setIsUploadModalOpen(true); }}
        emptyStateTitle="No documents found"
        emptyStateDescription="Upload your first document to start building the digital archive."
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

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={refresh}
        existingDocId={editingDocId}
      />

      <DocumentPreviewModal
        isOpen={Boolean(previewDocId)}
        onClose={() => setPreviewDocId(undefined)}
        documentId={previewDocId}
      />
    </PageContainer>
  );
};

export default DocumentList;
