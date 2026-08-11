import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Edit, ArrowLeft, Mail, Phone, MapPin, Building2, UserCheck, Shield, Tags, Globe, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Client } from '@/types/client';
import { clientService } from '@/services/ClientService';
import { departmentService } from '@/services/DepartmentService';
import { employeeService } from '@/services/EmployeeService';
import { ClientTeamManager } from '../components/ClientTeamManager';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';

export const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  
  // Relational Names
  const [departmentName, setDepartmentName] = useState<string>('Unassigned');
  const [managerName, setManagerName] = useState<string>('Unassigned');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      clientService.getById(id).then(cl => {
        if (cl) {
          setClient(cl);
          
          Promise.all([
            cl.departmentId ? departmentService.getById(cl.departmentId) : Promise.resolve(null),
            cl.managerId ? employeeService.getById(cl.managerId) : Promise.resolve(null)
          ]).then(([dept, mgr]) => {
             if (dept) setDepartmentName(dept.name);
             if (mgr) setManagerName(`${mgr.firstName} ${mgr.lastName}`);
          });

        } else {
          toast.error('Client not found');
          navigate('/clients');
        }
      }).finally(() => setLoading(false));
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </PageContainer>
    );
  }

  if (!client) return null;

  const initial = client.clientName.charAt(0);
  const isBusiness = client.clientType !== 'INDIVIDUAL';

  return (
    <PageContainer>
      <PageHeader
        title={isBusiness && client.companyName ? client.companyName : client.clientName}
        description={`Client Code: ${client.clientCode} | Type: ${client.clientType.replace('_', ' ')}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Clients', path: '/clients' },
          { label: 'Client Profile' }
        ]}
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/clients')}>
              <ArrowLeft size={16} className="mr-2" /> Directory
            </Button>
            <Button onClick={() => navigate(`/clients/${client.id}/edit`)}>
              <Edit size={16} className="mr-2" /> Edit Client
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: ID Card & Contact */}
        <div className="space-y-6">
          <SectionCard>
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl mb-4">
                {initial}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{client.clientName}</h2>
              {isBusiness && client.companyName && (
                <p className="text-sm font-medium text-gray-500 mt-1">{client.companyName}</p>
              )}
              <div className="mt-4 flex gap-2 justify-center">
                 <StatusBadge status={client.isArchived ? 'ARCHIVED' : client.status} />
                 {client.priority === 'HIGH' && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-800 bg-red-100 rounded-full">
                      HIGH PRIORITY
                    </span>
                 )}
              </div>
            </div>
            
            <div className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Primary Mobile</p>
                  <p className="text-sm text-gray-900">{client.mobile}</p>
                  {client.altMobile && <p className="text-xs text-gray-500 mt-1">{client.altMobile} (Alt)</p>}
                </div>
              </div>
              
              {client.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email Address</p>
                    <a href={`mailto:${client.email}`} className="text-sm text-blue-600 hover:underline">{client.email}</a>
                  </div>
                </div>
              )}

              {client.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Website</p>
                    <a href={client.website} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{client.website}</a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Address</p>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {[client.addressLine, client.city, client.state, client.country, client.pincode].filter(Boolean).join(', ') || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <ClientTeamManager 
            client={client} 
            onUpdate={() => clientService.getById(client.id).then(c => c && setClient(c))} 
          />

          <SectionCard title="Tax & Legal Identifiers">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2"><FileText size={16}/> PAN Number</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono font-medium">{client.pan}</dd>
              </div>
              {client.gst && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2"><FileText size={16}/> GSTIN</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono font-medium">{client.gst}</dd>
                </div>
              )}
              {client.tan && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2"><FileText size={16}/> TAN</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono font-medium">{client.tan}</dd>
                </div>
              )}
              {client.cin && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2"><FileText size={16}/> CIN</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono font-medium">{client.cin}</dd>
                </div>
              )}
              {client.aadhaar && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center gap-2"><FileText size={16}/> Aadhaar</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono font-medium">{client.aadhaar}</dd>
                </div>
              )}
            </dl>
          </SectionCard>

          {client.notes && (
            <SectionCard title="Internal Notes">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{client.notes}</p>
            </SectionCard>
          )}

        </div>
      </div>
    </PageContainer>
  );
};

export default ClientDetails;
