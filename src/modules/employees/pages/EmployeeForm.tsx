import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import { employeeSchema } from '@/schemas/employee.schema';
import { employeeService } from '@/services/EmployeeService';
import { departmentService } from '@/services/DepartmentService';
import { roleService } from '@/services/RoleService';
import { designationService } from '@/services/DesignationService';
import { STATUS_OPTIONS, STATUS } from '@/constants/status';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
];

const EMPLOYMENT_TYPES = [
  { label: 'Full Time', value: 'FULL_TIME' },
  { label: 'Part Time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Intern', value: 'INTERN' },
];

export const EmployeeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [departments, setDepartments] = useState<{label: string; value: string}[]>([]);
  const [roles, setRoles] = useState<{label: string; value: string}[]>([]);
  const [designations, setDesignations] = useState<{label: string; value: string}[]>([]);
  const [managers, setManagers] = useState<{label: string; value: string}[]>([]);

  const methods = useForm<any>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'MALE',
      dob: '',
      mobile: '',
      email: '',
      address: '',
      employeeId: '',
      departmentId: '',
      roleId: '',
      designationId: '',
      reportingManagerId: '',
      joiningDate: new Date().toISOString().split('T')[0],
      employmentType: 'FULL_TIME',
      status: STATUS.ACTIVE,
      emergencyContactName: '',
      emergencyContactMobile: '',
      emergencyContactRelation: '',
      notes: ''
    }
  });

  const { handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = methods;

  useEffect(() => {
    // Load lookup data
    Promise.all([
      departmentService.getAll(),
      roleService.getAll(),
      designationService.getAll(),
      employeeService.getAll()
    ]).then(([deps, rls, desigs, emps]) => {
      setDepartments(deps.map(d => ({ label: d.name, value: d.id })));
      setRoles(rls.map(r => ({ label: r.name, value: r.id })));
      setDesignations(desigs.map(d => ({ label: d.name, value: d.id })));
      setManagers([
        { label: 'None (Top Level)', value: '' },
        ...emps.filter(e => e.id !== id).map(e => {
          const designationName = desigs.find(d => d.id === e.designationId)?.name || 'Unknown';
          return { label: `${e.firstName} ${e.lastName} - ${designationName}`, value: e.id };
        })
      ]);

      if (!isEditMode) {
        // Auto-generate employee ID (e.g. EMP-001) based on total existing employees
        const newEmpId = `EMP-${String(emps.length + 1).padStart(3, '0')}`;
        setValue('employeeId', newEmpId);
      }
    });

    if (isEditMode && id) {
      employeeService.getById(id).then(emp => {
        if (emp) {
          reset({
            ...emp,
            reportingManagerId: emp.reportingManagerId || '',
            emergencyContactName: emp.emergencyContactName || '',
            emergencyContactMobile: emp.emergencyContactMobile || '',
            emergencyContactRelation: emp.emergencyContactRelation || '',
            address: emp.address || '',
            notes: emp.notes || ''
          });
        } else {
          toast.error('Employee not found');
          navigate('/employees');
        }
      });
    }
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (data: any) => {
    try {
      // Clean up empty strings
      const payload = {
        ...data,
        reportingManagerId: data.reportingManagerId || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactMobile: data.emergencyContactMobile || undefined,
        emergencyContactRelation: data.emergencyContactRelation || undefined,
      };

      if (isEditMode && id) {
        await employeeService.update(id, payload);
        toast.success('Employee profile updated');
      } else {
        await employeeService.create(payload);
        toast.success('Employee boarded successfully');
      }
      navigate('/employees');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={isEditMode ? 'Edit Employee Profile' : 'Onboard New Employee'}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Employees', path: '/employees' },
          { label: isEditMode ? 'Edit' : 'Onboard' }
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SectionCard title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput name="firstName" label="First Name" placeholder="John" />
              <FormInput name="lastName" label="Last Name" placeholder="Doe" />
              <FormSelect name="gender" label="Gender" options={GENDER_OPTIONS} />
              <FormInput name="dob" label="Date of Birth" type="date" />
              <FormInput name="email" label="Official Email" type="email" placeholder="john.doe@company.com" />
              <FormInput name="mobile" label="Mobile Number" placeholder="+1 234 567 8900" />
              <div className="md:col-span-2">
                <FormTextarea name="address" label="Residential Address" placeholder="Full residential address..." />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Employment Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput name="employeeId" label="Employee ID" placeholder="EMP-001" />
              <FormSelect name="employmentType" label="Employment Type" options={EMPLOYMENT_TYPES} />
              <FormInput name="joiningDate" label="Joining Date" type="date" />
              <FormSelect name="status" label="Status" options={STATUS_OPTIONS} />
              
              <div className="md:col-span-2">
                <hr className="my-2 border-gray-100" />
              </div>

              <FormSelect name="departmentId" label="Department" options={departments} />
              <FormSelect name="designationId" label="Designation" options={designations} />
              <FormSelect name="roleId" label="System Role" options={roles} />
              <FormSelect name="reportingManagerId" label="Reporting Manager" options={managers} />
            </div>
          </SectionCard>

          <SectionCard title="Emergency Contact" description="Optional emergency contact details.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput name="emergencyContactName" label="Contact Person" placeholder="Jane Doe" />
              <FormInput name="emergencyContactRelation" label="Relation" placeholder="Spouse" />
              <FormInput name="emergencyContactMobile" label="Emergency Mobile" placeholder="+1 234 567 8900" />
            </div>
          </SectionCard>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : (isEditMode ? 'Update Profile' : 'Complete Onboarding')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default EmployeeForm;
