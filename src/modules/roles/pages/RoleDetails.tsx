import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Edit, ArrowLeft, Shield, Users, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Role } from '@/types/role';
import { roleService } from '@/services/RoleService';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';

export const RoleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      roleService.getById(id).then(r => {
        if (r) {
          setRole(r);
        } else {
          toast.error('Role not found');
          navigate('/roles');
        }
      }).finally(() => setLoading(false));
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="h-12 w-1/3 mb-8" />
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }

  if (!role) return null;

  const totalPermissions = role.permissions ? 
    Object.values(role.permissions).reduce((acc, module) => 
      acc + Object.values(module).filter(Boolean).length
    , 0) : 0;

  return (
    <PageContainer>
      <PageHeader
        title={role.name}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Roles', path: '/roles' },
          { label: role.name }
        ]}
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/roles')}>
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            <Button onClick={() => navigate(`/roles/${role.id}/edit`)}>
              <Edit size={16} className="mr-2" /> Edit Permissions
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Role Overview">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Role Code</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{role.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <StatusBadge status={role.isArchived ? 'ARCHIVED' : role.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Hierarchy Level</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full">
                    Level {role.hierarchyLevel}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{format(new Date(role.createdAt), 'MMMM dd, yyyy')}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 leading-relaxed">
                  {role.description || 'No description provided.'}
                </dd>
              </div>
            </dl>
          </SectionCard>
          
          <SectionCard title="Permission Summary">
             <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-700">
                  This role grants access to <span className="font-bold">{totalPermissions}</span> discrete permissions across the application.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate(`/roles/${role.id}/edit`)}>
                  View Full Matrix
                </Button>
             </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Quick Stats">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Assigned Employees</p>
                <p className="text-2xl font-bold text-gray-900">{role.employeeCount || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">System Access</p>
                <p className="text-sm font-medium text-green-700 mt-1">Authorized</p>
              </div>
            </div>
          </SectionCard>

          {(role.hierarchyLevel === 1 || role.code === 'SA') && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-3">
              <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Protected Role</h4>
                <p className="text-xs text-yellow-700 mt-1">This is a core system role (Owner) and cannot be archived or permanently deleted.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default RoleDetails;
