import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import { designationSchema } from '@/schemas/designation.schema';
import { designationService } from '@/services/DesignationService';
import { departmentService } from '@/services/DepartmentService';
import { STATUS_OPTIONS, STATUS } from '@/constants/status';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';

const HIERARCHY_OPTIONS = Array.from({ length: 15 }, (_, i) => ({
  label: `Level ${i + 1}${i === 0 ? ' (Highest)' : ''}`,
  value: i + 1
}));

export const DesignationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [departments, setDepartments] = useState<{label: string; value: string}[]>([]);

  const methods = useForm<any>({
    resolver: zodResolver(designationSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      departmentId: '',
      hierarchyLevel: 5,
      status: STATUS.ACTIVE,
    }
  });

  const { handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = methods;
  const nameValue = watch('name');
  const lastAutoCode = useRef<string>('');

  // Auto-generate code continuously if the field is empty or matches our last auto-generated value
  useEffect(() => {
    const currentCode = methods.getValues('code');
    const isCodeUntouched = !currentCode || currentCode === lastAutoCode.current;

    if (!isEditMode && nameValue && isCodeUntouched) {
      const words = nameValue.split(' ').filter((w: string) => w.length > 0);
      let generatedCode = '';
      
      if (words.length === 1) {
        generatedCode = words[0].substring(0, 3).toUpperCase();
      } else {
        generatedCode = words.map((w: string) => w[0]).join('').substring(0, 4).toUpperCase();
      }
      
      lastAutoCode.current = generatedCode;
      setValue('code', generatedCode);
      methods.clearErrors('code');
    } else if (!isEditMode && !nameValue && isCodeUntouched && currentCode !== '') {
      lastAutoCode.current = '';
      setValue('code', '');
      methods.clearErrors('code');
    }
  }, [nameValue, isEditMode, setValue, methods]);

  useEffect(() => {
    // Load departments for the dropdown
    departmentService.getAll().then(deps => {
      setDepartments([
        { label: 'Global (No Department)', value: '' },
        ...deps.map(d => ({ label: d.name, value: d.id }))
      ]);
    });

    if (isEditMode && id) {
      designationService.getById(id).then(designation => {
        if (designation) {
          reset({
            name: designation.name,
            code: designation.code,
            description: designation.description || '',
            departmentId: designation.departmentId || '',
            hierarchyLevel: designation.hierarchyLevel,
            status: designation.status,
          });
        } else {
          toast.error('Designation not found');
          navigate('/designations');
        }
      });
    }
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        departmentId: data.departmentId || undefined // Clean up empty string
      };

      if (isEditMode && id) {
        await designationService.update(id, payload);
        toast.success('Designation updated successfully');
      } else {
        await designationService.create(payload);
        toast.success('Designation created successfully');
      }
      navigate('/designations');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={isEditMode ? 'Edit Designation' : 'Create New Designation'}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Designations', path: '/designations' },
          { label: isEditMode ? 'Edit' : 'Create' }
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SectionCard title="General Information" description="Define the job title identity and organizational placement.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="name"
                label="Designation Name"
                placeholder="e.g. Senior Audit Manager"
              />
              <FormInput
                name="code"
                label="Designation Code"
                placeholder="e.g. SAM"
                helperText="Auto-generated from name, but can be customized."
              />
              <FormSelect
                name="departmentId"
                label="Department Mapping"
                options={departments}
                helperText="Leave as Global if this designation applies across multiple departments."
              />
              <FormSelect
                name="hierarchyLevel"
                label="Hierarchy Level"
                options={HIERARCHY_OPTIONS}
                helperText="Determines reporting lines."
              />
              <FormSelect
                name="status"
                label="Status"
                options={STATUS_OPTIONS}
              />
              <div className="md:col-span-2">
                <FormTextarea
                  name="description"
                  label="Description (Optional)"
                  placeholder="Provide a brief overview of this designation's responsibilities."
                />
              </div>
            </div>
          </SectionCard>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/designations')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Designation')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default DesignationForm;
