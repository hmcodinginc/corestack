import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import { roleSchema, RoleFormValues } from '@/schemas/role.schema';
import { roleService } from '@/services/RoleService';
import { STATUS_OPTIONS, STATUS } from '@/constants/status';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';
import { PermissionMatrix } from '../components/PermissionMatrix';

const HIERARCHY_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  label: `Level ${i + 1}${i === 0 ? ' (Highest)' : ''}`,
  value: i + 1
}));

export const RoleForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const methods = useForm<any>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      hierarchyLevel: 5,
      status: STATUS.ACTIVE,
      permissions: {}
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
      roleService.getById(id).then(role => {
        if (role) {
          reset({
            name: role.name,
            code: role.code,
            description: role.description || '',
            hierarchyLevel: role.hierarchyLevel,
            status: role.status,
            permissions: role.permissions || {}
          });
        } else {
          toast.error('Role not found');
          navigate('/roles');
        }
      });
    }
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && id) {
        await roleService.update(id, data);
        toast.success('Role updated successfully');
      } else {
        await roleService.create(data);
        toast.success('Role created successfully');
      }
      navigate('/roles');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={isEditMode ? 'Edit Role & Permissions' : 'Create New Role'}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Roles', path: '/roles' },
          { label: isEditMode ? 'Edit' : 'Create' }
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SectionCard title="Basic Information" description="Define the role's core identity and hierarchy.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="name"
                label="Role Name"
                placeholder="e.g. Senior Accountant"
              />
              <FormInput
                name="code"
                label="Role Code"
                placeholder="e.g. SR-ACC"
                helperText="A unique shortcode for this role."
              />
              <FormSelect
                name="hierarchyLevel"
                label="Hierarchy Level"
                options={HIERARCHY_OPTIONS}
                helperText="Determines reporting lines and approval limits."
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
                  placeholder="Provide a brief overview of this role's responsibilities."
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Permission Matrix" description="Configure exact granular access across all modules for this role." bodyClassName="p-0">
            <PermissionMatrix />
          </SectionCard>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/roles')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Role')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default RoleForm;
