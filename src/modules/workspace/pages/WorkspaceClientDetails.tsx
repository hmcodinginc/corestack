import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { clientService } from '@/services/ClientService';
import { Client } from '@/types/client';

export const WorkspaceClientDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchClient = async () => {
      try {
        if (!user || !id) return;
        
        // Use getByEmployee to inherently check authorization
        const myClients = await clientService.getByEmployee(user.id);
        const authorizedClient = myClients.find(c => c.id === id);
        
        if (!authorizedClient) {
           navigate('/unauthorized');
           return;
        }
        
        setClient(authorizedClient);
      } catch (err) {
        navigate('/workspace/clients');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id, user, navigate]);

  if (loading) return <PageContainer><p>Loading...</p></PageContainer>;
  if (!client) return null;

  return (
    <PageContainer>
      <div className="mb-4">
        <button 
          onClick={() => navigate('/workspace/clients')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to My Clients
        </button>
      </div>
      
      <PageHeader
        title={`Client Details: ${client.clientName}`}
        description="View client information and related tasks"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-sm font-medium text-gray-500">Name</span>
            <span className="block text-base text-gray-900">{client.clientName}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Industry</span>
            <span className="block text-base text-gray-900">{client.industry || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Email</span>
            <span className="block text-base text-gray-900">{client.email || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Phone</span>
            <span className="block text-base text-gray-900">{client.mobile || 'N/A'}</span>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4">Recent Documents</h3>
          <p className="text-sm text-gray-500">No documents found for this client.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default WorkspaceClientDetails;
