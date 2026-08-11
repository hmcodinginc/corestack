import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { invoiceSchema } from '@/schemas/billing.schema';
import { invoiceService } from '@/services/BillingService';
import { clientService } from '@/services/ClientService';
import { taskService } from '@/services/TaskService';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';

export const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const isEditMode = Boolean(id);
  const isQuotation = location.pathname.includes('/quotation/');

  const [clients, setClients] = useState<{label: string, value: string}[]>([]);
  const [allTasks, setAllTasks] = useState<{id: string, clientId: string, taskCode: string, taskName: string}[]>([]);
  const [isArchived, setIsArchived] = useState(false);

  const methods = useForm<any>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      type: isQuotation ? 'QUOTATION' : 'INVOICE',
      clientId: '',
      departmentId: '',
      taskIds: [],
      status: isQuotation ? 'DRAFT' : 'SENT',
      billingDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      discountPercentage: 0,
      taxPercentage: 18,
      notes: '',
      terms: isQuotation ? 'Validity: 30 days.' : 'Payment due upon receipt.',
      items: [{ id: uuidv4(), description: '', quantity: 0, rate: 0, amount: 0 }]
    }
  });

  const { handleSubmit, reset, formState: { isSubmitting }, control, setValue } = methods;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = useWatch({ control, name: 'items' }) || [];
  const watchDiscount = useWatch({ control, name: 'discountPercentage' }) || 0;
  const watchTax = useWatch({ control, name: 'taxPercentage' }) || 0;
  const watchClientId = useWatch({ control, name: 'clientId' });

  useEffect(() => {
    Promise.all([
      clientService.getAll(),
      taskService.getAll()
    ]).then(([clientData, taskData]) => {
      setClients(clientData.filter(c => !c.isArchived).map(c => ({ label: `${c.clientName} (${c.clientCode})`, value: c.id })));
      // Store all completed tasks
      setAllTasks(taskData.filter(t => t.status === 'COMPLETED').map(t => ({ id: t.id, clientId: t.clientId, taskCode: t.taskCode, taskName: t.taskName })));
    });

    if (isEditMode && id) {
      invoiceService.getById(id).then(inv => {
        if (inv) {
          setIsArchived(inv.isArchived);
          reset({
            ...inv,
            billingDate: inv.billingDate || '',
            dueDate: inv.dueDate || '',
            notes: inv.notes || '',
            terms: inv.terms || '',
          });
        }
      });
    }
  }, [id, isEditMode, reset]);

  // Auto-calculate item amounts when quantity or rate changes
  useEffect(() => {
    watchItems.forEach((item: any, index: number) => {
      const amt = (item.quantity || 0) * (item.rate || 0);
      if (amt !== item.amount) {
        setValue(`items.${index}.amount`, amt, { shouldValidate: true });
      }
    });
  }, [watchItems, setValue]);

  // Dynamically filter tasks based on the selected client
  const filteredTasks = watchClientId 
    ? allTasks.filter(t => t.clientId === watchClientId).map(t => ({ label: `${t.taskCode} - ${t.taskName}`, value: t.id }))
    : [];

  const { subtotal, discountAmount, taxAmount, totalAmount } = invoiceService.calculateTotals(watchItems, watchDiscount, watchTax);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && id) {
        await invoiceService.update(id, data);
        toast.success(`${data.type} updated successfully`);
      } else {
        await invoiceService.create(data);
        toast.success(`${data.type} created successfully`);
      }
      navigate('/billing');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  if (isArchived) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">This Document is Archived</h2>
          <p className="text-gray-500 mb-6">Archived invoices/quotations cannot be edited.</p>
          <Button onClick={() => navigate('/billing')}>Back to Billing</Button>
        </div>
      </PageContainer>
    );
  }

  const titlePrefix = isEditMode ? 'Edit' : 'Create New';
  const docType = isQuotation ? 'Quotation' : 'Invoice';

  return (
    <PageContainer>
      <PageHeader
        title={`${titlePrefix} ${docType}`}
        description={`Fill out the ${docType.toLowerCase()} details below.`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Billing', path: '/billing' },
          { label: isEditMode ? 'Edit' : 'New' }
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Client & Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect name="clientId" label="Client" options={clients} />
              <FormSelect 
                name="taskIds" 
                label="Link Completed Tasks (Optional)" 
                options={filteredTasks} 
                multiple 
                helperText={!watchClientId ? "Please select a Client first." : "Hold Ctrl/Cmd to select multiple. Only completed tasks for this client are shown."}
              />
              
              <FormInput name="billingDate" label={`${docType} Date`} type="date" />
              <FormInput name="dueDate" label={isQuotation ? "Valid Until" : "Due Date"} type="date" />
              
              {!isQuotation && (
                 <FormSelect 
                   name="status" 
                   label="Status" 
                   options={[
                     { label: 'Draft', value: 'DRAFT' },
                     { label: 'Sent', value: 'SENT' }
                   ]} 
                 />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
               <h3 className="text-lg font-bold text-gray-900">Line Items</h3>
            </div>
            
            <div className="space-y-3">
              {/* Header row for desktop */}
              <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-bold text-gray-500 uppercase px-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qty / Hrs</div>
                <div className="col-span-2">Rate (₹)</div>
                <div className="col-span-2 text-right">Amount (₹)</div>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-lg group">
                  <div className="md:col-span-6">
                    <FormInput 
                      name={`items.${index}.description`} 
                      placeholder="Item description" 
                      label=""
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormInput 
                      name={`items.${index}.quantity`} 
                      type="number" 
                      step="1" 
                      label=""
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormInput 
                      name={`items.${index}.rate`} 
                      type="number" 
                      step="0.01" 
                      label=""
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3 mt-8 md:mt-0">
                    <span className="font-mono text-gray-900 font-medium md:pt-3">
                       ₹{((watchItems[index]?.quantity || 0) * (watchItems[index]?.rate || 0)).toLocaleString()}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => remove(index)}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded md:opacity-0 group-hover:opacity-100 transition-all md:mt-2"
                      disabled={fields.length === 1}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ id: uuidv4(), description: '', quantity: 0, rate: 0, amount: 0 })} 
              className="mt-4 flex items-center gap-2"
            >
              <Plus size={16} /> Add Line Item
            </Button>

            {methods.formState.errors.items && (
               <p className="text-red-500 text-sm mt-4 font-medium bg-red-50 p-2 rounded border border-red-200">
                  {methods.formState.errors.items.message as string}
               </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8 justify-between">
            <div className="flex-1 space-y-4">
              <FormTextarea name="notes" label="Client Notes" placeholder="Thanks for your business!" />
              <FormTextarea name="terms" label="Terms & Conditions" placeholder="Payment due within 30 days..." />
            </div>
            
            <div className="w-full md:w-80 space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-600">Subtotal:</span>
                 <span className="font-mono font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
               </div>
               
               <div className="flex items-center gap-4">
                 <div className="flex-1">
                   <FormInput name="discountPercentage" label="Discount (%)" type="number" step="0.1" max="100" />
                 </div>
                 <div className="text-right pt-6">
                   <span className="font-mono text-sm text-red-600">- ₹{discountAmount.toLocaleString()}</span>
                 </div>
               </div>

               <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                 <div className="flex-1">
                   <FormInput name="taxPercentage" label="Tax/GST (%)" type="number" step="0.1" max="100" />
                 </div>
                 <div className="text-right pt-6">
                   <span className="font-mono text-sm text-gray-600">+ ₹{taxAmount.toLocaleString()}</span>
                 </div>
               </div>

               <div className="flex justify-between items-center pt-2">
                 <span className="text-base font-bold text-gray-900">Total:</span>
                 <span className="text-xl font-bold font-mono text-primary">₹{totalAmount.toLocaleString()}</span>
               </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/billing')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : `Save ${docType}`}
            </Button>
          </div>
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default InvoiceForm;
