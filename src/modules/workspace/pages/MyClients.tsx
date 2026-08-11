import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/table/DataTable';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { clientService } from '@/services/ClientService';

export const MyClients: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        if (user?.id) {
          const fetchedClients = await clientService.getByEmployee(user.id);
          setClients(fetchedClients);
        }
      } catch (error) {
        console.error('Failed to fetch clients', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [user]);

  const columns = [
    { accessorKey: 'clientName', header: 'Client Name' },
    { accessorKey: 'clientType', header: 'Type' },
    { accessorKey: 'email', header: 'Contact Email' }
  ];

  const handleRowClick = (client: any) => {
    navigate(`/workspace/clients/${client.id}`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="My Clients"
        description="Clients assigned to you"
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <DataTable
          columns={columns}
          data={clients}
          loading={loading}
          onRowClick={handleRowClick}
          pagination={pagination}
          setPagination={setPagination}
          totalItems={clients.length}
        />
      </div>
    </PageContainer>
  );
};

export default MyClients;
