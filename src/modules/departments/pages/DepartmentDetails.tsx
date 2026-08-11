import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Edit, ArrowLeft, Users, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Department } from '@/types/department';
import { departmentService } from '@/services/DepartmentService';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';

export const DepartmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      departmentService.getById(id).then(dept => {
        if (dept) {
          setDepartment(dept);
        } else {
          toast.error('Department not found');
          navigate('/departments');
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

  if (!department) return null;

  return (
    <PageContainer>
      <PageHeader
        title={department.name}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Departments', path: '/departments' },
          { label: department.name }
        ]}
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/departments')}>
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            <Button onClick={() => navigate(`/departments/${department.id}/edit`)}>
              <Edit size={16} className="mr-2" /> Edit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Department Overview">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Department Code</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{department.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <StatusBadge status={department.isArchived ? 'ARCHIVED' : department.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Department Head</dt>
                <dd className="mt-1 text-sm text-gray-900">{department.head || 'Not Assigned'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{format(new Date(department.createdAt), 'MMMM dd, yyyy')}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 leading-relaxed">
                  {department.description || 'No description provided.'}
                </dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Quick Stats">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">{department.activeEmployeeCount || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-full text-gray-600">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
};

export default DepartmentDetails;
