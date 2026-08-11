import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import { clientSchema } from '@/schemas/client.schema';
import { clientService } from '@/services/ClientService';
import { departmentService } from '@/services/DepartmentService';
import { employeeService } from '@/services/EmployeeService';
import { STATUS_OPTIONS, STATUS } from '@/constants/status';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';

const CLIENT_TYPES = [
  { label: 'Individual', value: 'INDIVIDUAL' },
  { label: 'Business', value: 'BUSINESS' },
  { label: 'Company', value: 'COMPANY' },
  { label: 'Partnership', value: 'PARTNERSHIP' },
  { label: 'LLP', value: 'LLP' },
  { label: 'Trust', value: 'TRUST' },
  { label: 'NGO', value: 'NGO' },
  { label: 'Other', value: 'OTHER' },
];

const PRIORITY_LEVELS = [
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

export const ClientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [departments, setDepartments] = useState<{label: string; value: string}[]>([]);
  const [employees, setEmployees] = useState<{label: string; value: string}[]>([]);

  const methods = useForm<any>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      clientCode: '',
      clientType: 'INDIVIDUAL',
      clientName: '',
      companyName: '',
      pan: '',
      gst: '',
      tan: '',
      cin: '',
      aadhaar: '',
      mobile: '',
      altMobile: '',
      email: '',
      website: '',
      addressLine: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      industry: '',
      businessCategory: '',
      annualTurnover: '',
      registrationDate: '',
      departmentId: '',
      managerId: '',
      employeeIds: [],
      status: STATUS.ACTIVE,
      priority: 'MEDIUM',
      notes: '',
      tags: [],
    }
  });

  const { handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = methods;
  const nameValue = watch('clientName');
  const typeValue = watch('clientType');
  const lastAutoCode = useRef<string>('');

  // Auto-generate code continuously if the field is empty or matches our last auto-generated value
  useEffect(() => {
    const currentCode = methods.getValues('clientCode');
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
      setValue('clientCode', generatedCode);
      methods.clearErrors('clientCode');
    } else if (!isEditMode && !nameValue && isCodeUntouched && currentCode !== '') {
      lastAutoCode.current = '';
      setValue('clientCode', '');
      methods.clearErrors('clientCode');
    }
  }, [nameValue, isEditMode, setValue, methods]);


  useEffect(() => {
    Promise.all([
      departmentService.getAll(),
      employeeService.getAll()
    ]).then(([deps, emps]) => {
      setDepartments([
        { label: 'Unassigned', value: '' },
        ...deps.filter(d => d.status === 'ACTIVE').map(d => ({ label: d.name, value: d.id }))
      ]);
      setEmployees([
        { label: 'Unassigned', value: '' },
        ...emps.filter(e => e.status === 'ACTIVE').map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))
      ]);
    });

    if (isEditMode && id) {
      clientService.getById(id).then(client => {
        if (client) {
          reset({
            ...client,
            companyName: client.companyName || '',
            gst: client.gst || '',
            tan: client.tan || '',
            cin: client.cin || '',
            aadhaar: client.aadhaar || '',
            altMobile: client.altMobile || '',
            email: client.email || '',
            website: client.website || '',
            addressLine: client.addressLine || '',
            city: client.city || '',
            state: client.state || '',
            country: client.country || '',
            pincode: client.pincode || '',
            industry: client.industry || '',
            businessCategory: client.businessCategory || '',
            annualTurnover: client.annualTurnover || '',
            registrationDate: client.registrationDate || '',
            departmentId: client.departmentId || '',
            managerId: client.managerId || '',
            notes: client.notes || '',
          });
        } else {
          toast.error('Client not found');
          navigate('/clients');
        }
      });
    }
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (data: any) => {
    try {
      // Clean up empty strings to optional undefined
      const payload = {
        ...data,
        gst: data.gst || undefined,
        tan: data.tan || undefined,
        cin: data.cin || undefined,
        aadhaar: data.aadhaar || undefined,
        altMobile: data.altMobile || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        departmentId: data.departmentId || undefined,
        managerId: data.managerId || undefined,
      };

      if (isEditMode && id) {
        await clientService.update(id, payload);
        toast.success('Client profile updated');
      } else {
        await clientService.create(payload);
        toast.success('Client registered successfully');
      }
      navigate('/clients');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={isEditMode ? 'Edit Client Profile' : 'Register New Client'}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Clients', path: '/clients' },
          { label: isEditMode ? 'Edit' : 'Register' }
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SectionCard title="General Information" description="Primary identification and tax details.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormSelect name="clientType" label="Client Type" options={CLIENT_TYPES} />
              <FormInput name="clientName" label="Client Name" placeholder="Full Name" />
              <FormInput name="clientCode" label="Client Code" placeholder="Auto-generated" />
              
              {typeValue !== 'INDIVIDUAL' && (
                <div className="md:col-span-3">
                  <FormInput name="companyName" label="Company / Entity Name" placeholder="Business Name Ltd." />
                </div>
              )}
              
              <FormInput name="pan" label="PAN" placeholder="ABCDE1234F" />
              <FormInput name="gst" label="GSTIN (Optional)" placeholder="22AAAAA0000A1Z5" />
              {typeValue === 'INDIVIDUAL' ? (
                 <FormInput name="aadhaar" label="Aadhaar (Optional)" placeholder="12 Digit Number" />
              ) : (
                 <FormInput name="tan" label="TAN (Optional)" placeholder="ABCD12345E" />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Contact & Address" description="Communication and billing address.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput name="mobile" label="Primary Mobile" placeholder="+91 9876543210" />
              <FormInput name="altMobile" label="Alternate Mobile (Optional)" placeholder="+91 9876543211" />
              <FormInput name="email" label="Email Address (Optional)" type="email" placeholder="client@example.com" />
              <FormInput name="website" label="Website (Optional)" placeholder="https://www.example.com" />
              
              <div className="md:col-span-2">
                <hr className="my-2 border-gray-100" />
              </div>

              <div className="md:col-span-2">
                <FormInput name="addressLine" label="Address Line" placeholder="Flat, Building, Street..." />
              </div>
              <FormInput name="city" label="City" placeholder="City" />
              <FormInput name="state" label="State" placeholder="State" />
              <FormInput name="country" label="Country" placeholder="Country" />
              <FormInput name="pincode" label="Pincode" placeholder="Pincode" />
            </div>
          </SectionCard>

          <SectionCard title="Team Assignment & Status" description="Assign internal departments and managers.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect name="departmentId" label="Assigned Department" options={departments} />
              <FormSelect name="managerId" label="Assigned Manager" options={employees} />
              
              {/* Employee multiple assignment (simplified for this UI phase, typically a multi-select component) */}
              
              <FormSelect name="status" label="Client Status" options={STATUS_OPTIONS} />
              <FormSelect name="priority" label="Priority Level" options={PRIORITY_LEVELS} />
              
              <div className="md:col-span-2">
                <FormTextarea name="notes" label="Internal Notes (Optional)" placeholder="Any special instructions for this client." />
              </div>
            </div>
          </SectionCard>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/clients')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : (isEditMode ? 'Update Client' : 'Register Client')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default ClientForm;
