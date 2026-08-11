import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Edit, ArrowLeft, Award, Users, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Designation } from '@/types/designation';
import { designationService } from '@/services/DesignationService';
import { departmentService } from '@/services/DepartmentService';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';

export const DesignationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [designation, setDesignation] = useState<Designation | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('Global (No specific department)');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      designationService.getById(id).then(d => {
        if (d) {
          setDesignation(d);
          if (d.departmentId) {
             departmentService.getById(d.departmentId).then(dept => {
                if (dept) setDepartmentName(dept.name);
             });
          }
        } else {
          toast.error('Designation not found');
          navigate('/designations');
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

  if (!designation) return null;

  return (
    <PageContainer>
      <PageHeader
        title={designation.name}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Designations', path: '/designations' },
          { label: designation.name }
        ]}
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/designations')}>
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            <Button onClick={() => navigate(`/designations/${designation.id}/edit`)}>
              <Edit size={16} className="mr-2" /> Edit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Designation Overview">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Designation Code</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{designation.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <StatusBadge status={designation.isArchived ? 'ARCHIVED' : designation.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Hierarchy Level</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-purple-800 bg-purple-100 rounded-full">
                    Level {designation.hierarchyLevel}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{format(new Date(designation.createdAt), 'MMMM dd, yyyy')}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 leading-relaxed">
                  {designation.description || 'No description provided.'}
                </dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Organizational Placement">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Department Mapping</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{departmentName}</p>
              </div>
            </div>
            
            <hr className="border-gray-200 my-4" />

            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Assigned Employees</p>
                <p className="text-2xl font-bold text-gray-900">{designation.employeeCount || 0}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
};

export default DesignationDetails;
