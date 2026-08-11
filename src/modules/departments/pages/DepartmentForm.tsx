import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import { departmentSchema, DepartmentFormValues } from '@/schemas/department.schema';
import { departmentService } from '@/services/DepartmentService';
import { STATUS_OPTIONS, STATUS } from '@/constants/status';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';

export const DepartmentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const methods = useForm<any>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      head: '',
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
    if (isEditMode && id) {
      departmentService.getById(id).then(dept => {
        if (dept) {
          reset({
            name: dept.name,
            code: dept.code,
            description: dept.description || '',
            head: dept.head || '',
            status: dept.status,
          });
        } else {
          toast.error('Department not found');
          navigate('/departments');
        }
      });
    }
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && id) {
        await departmentService.update(id, data);
        toast.success('Department updated successfully');
      } else {
        await departmentService.create(data);
        toast.success('Department created successfully');
      }
      navigate('/departments');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={isEditMode ? 'Edit Department' : 'Create Department'}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Departments', path: '/departments' },
          { label: isEditMode ? 'Edit' : 'Create' }
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SectionCard title="Basic Information" description="Enter the core details of the department.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="name"
                label="Department Name"
                placeholder="e.g. Audit & Assurance"
              />
              <FormInput
                name="code"
                label="Department Code"
                placeholder="e.g. AUD"
                helperText="A unique shortcode for this department."
              />
              <FormSelect
                name="status"
                label="Status"
                options={STATUS_OPTIONS}
              />
              <FormInput
                name="head"
                label="Department Head (Optional)"
                placeholder="e.g. John Doe"
              />
              <div className="md:col-span-2">
                <FormTextarea
                  name="description"
                  label="Description (Optional)"
                  placeholder="Provide a brief overview of this department's function."
                />
              </div>
            </div>
          </SectionCard>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/departments')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Department')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default DepartmentForm;
