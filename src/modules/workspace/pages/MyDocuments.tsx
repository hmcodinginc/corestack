import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { useAuth } from '@/context/AuthContext';
import { documentService } from '@/services/DocumentService';
import { notificationService } from '@/services/NotificationService';
import { Download } from 'lucide-react';
import { downloadDummyFile } from '@/utils/downloadUtils';
import { toast } from 'react-hot-toast';

export const MyDocuments: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (user?.id) {
          const fetchedDocuments = await documentService.getByEmployee(user.id);
          setDocuments(fetchedDocuments);
        }
      } catch (error) {
        console.error('Failed to fetch docs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [user]);

  const paginatedData = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return documents.slice(start, start + pagination.pageSize);
  }, [documents, pagination]);

  const handleDownload = async (doc: any) => {
    try {
      downloadDummyFile(doc.documentName || 'document.txt');
      toast.success('Download started');
      
      // Notify Admin
      await notificationService.createNotification(
        'Document Downloaded',
        `${user?.firstName} ${user?.lastName} downloaded document: ${doc.documentName}`,
        'Document Download',
        'NORMAL',
        '1', // Admin ID
        'DOCUMENTS',
        doc.id,
        '/documents'
      );
    } catch (e) {
      toast.error('Failed to download document');
    }
  };

  const columns = [
    { accessorKey: 'documentName', header: 'Document Name' },
    { accessorKey: 'clientId', header: 'Client ID' },
    { accessorKey: 'createdAt', header: 'Uploaded' },
    { accessorKey: 'category', header: 'Category' },
    { 
      id: 'actions', 
      header: 'Actions',
      cell: ({ row }: any) => (
        <button 
          onClick={() => handleDownload(row.original)}
          className="text-primary hover:text-primary-dark"
          title="Download"
        >
          <Download size={18} />
        </button>
      )
    }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="My Documents"
        description="Access documents relevant to your assignments"
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <DataTable
          columns={columns}
          data={paginatedData}
          loading={loading}
          pagination={pagination}
          setPagination={setPagination}
          totalItems={documents.length}
        />
      </div>
    </PageContainer>
  );
};

export default MyDocuments;
