import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Edit, ArrowLeft, Mail, Phone, MapPin, Briefcase, Building2, Shield, Calendar, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Employee } from '@/types/employee';
import { employeeService } from '@/services/EmployeeService';
import { departmentService } from '@/services/DepartmentService';
import { roleService } from '@/services/RoleService';
import { designationService } from '@/services/DesignationService';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';

export const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  
  // Relational Names
  const [departmentName, setDepartmentName] = useState<string>('Loading...');
  const [roleName, setRoleName] = useState<string>('Loading...');
  const [designationName, setDesignationName] = useState<string>('Loading...');
  const [managerName, setManagerName] = useState<string>('None');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      employeeService.getById(id).then(emp => {
        if (emp) {
          setEmployee(emp);
          
          Promise.all([
            departmentService.getById(emp.departmentId),
            roleService.getById(emp.roleId),
            designationService.getById(emp.designationId),
            emp.reportingManagerId ? employeeService.getById(emp.reportingManagerId) : Promise.resolve(null)
          ]).then(([dept, role, desig, mgr]) => {
             if (dept) setDepartmentName(dept.name);
             if (role) setRoleName(role.name);
             if (desig) setDesignationName(desig.name);
             if (mgr) setManagerName(`${mgr.firstName} ${mgr.lastName}`);
          });

        } else {
          toast.error('Employee not found');
          navigate('/employees');
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

  if (!employee) return null;

  const initial = employee.firstName.charAt(0) + employee.lastName.charAt(0);

  return (
    <PageContainer>
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        description={`Employee ID: ${employee.employeeId}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Employees', path: '/employees' },
          { label: 'Profile View' }
        ]}
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/employees')}>
              <ArrowLeft size={16} className="mr-2" /> Directory
            </Button>
            <Button onClick={() => navigate(`/employees/${employee.id}/edit`)}>
              <Edit size={16} className="mr-2" /> Edit Profile
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
              <h2 className="text-xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">{designationName}</p>
              <div className="mt-4">
                 <StatusBadge status={employee.isArchived ? 'ARCHIVED' : employee.status} />
              </div>
            </div>
            
            <div className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Official Email</p>
                  <a href={`mailto:${employee.email}`} className="text-sm text-blue-600 hover:underline">{employee.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Mobile Number</p>
                  <p className="text-sm text-gray-900">{employee.mobile}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Address</p>
                  <p className="text-sm text-gray-900">{employee.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <SectionCard title="Organizational Matrix">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Building2 className="w-8 h-8 text-blue-500 bg-blue-100 p-1.5 rounded" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Department</p>
                  <p className="text-sm font-semibold text-gray-900">{departmentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Shield className="w-8 h-8 text-purple-500 bg-purple-100 p-1.5 rounded" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">System Role</p>
                  <p className="text-sm font-semibold text-gray-900">{roleName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <UserCheck className="w-8 h-8 text-green-500 bg-green-100 p-1.5 rounded" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Reporting To</p>
                  <p className="text-sm font-semibold text-gray-900">{managerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="w-8 h-8 text-orange-500 bg-orange-100 p-1.5 rounded" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Joined On</p>
                  <p className="text-sm font-semibold text-gray-900">{format(new Date(employee.joiningDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Personal Information">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900">{employee.gender}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="mt-1 text-sm text-gray-900">{format(new Date(employee.dob), 'MMMM dd, yyyy')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Employment Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{employee.employmentType.replace('_', ' ')}</dd>
              </div>
            </dl>
          </SectionCard>

          {employee.emergencyContactName && (
            <SectionCard title="Emergency Contact">
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{employee.emergencyContactName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                  <dd className="mt-1 text-sm text-gray-900">{employee.emergencyContactRelation || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mobile</dt>
                  <dd className="mt-1 text-sm text-gray-900">{employee.emergencyContactMobile}</dd>
                </div>
              </dl>
            </SectionCard>
          )}

        </div>
      </div>
    </PageContainer>
  );
};

export default EmployeeDetails;
