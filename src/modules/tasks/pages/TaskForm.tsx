import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate as useAppNavigate, useParams as useAppParams } from 'react-router-dom';

import { taskSchema } from '@/schemas/task.schema';
import { taskService } from '@/services/TaskService';
import { clientService } from '@/services/ClientService';
import { employeeService } from '@/services/EmployeeService';
import { departmentService } from '@/services/DepartmentService';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';

const CATEGORY_OPTIONS = [
  { label: 'GST Return', value: 'GST Return' },
  { label: 'Income Tax Return', value: 'Income Tax Return' },
  { label: 'Audit', value: 'Audit' },
  { label: 'Bookkeeping', value: 'Bookkeeping' },
  { label: 'ROC Filing', value: 'ROC Filing' },
  { label: 'TDS', value: 'TDS' },
  { label: 'Payroll', value: 'Payroll' },
  { label: 'Compliance', value: 'Compliance' },
  { label: 'Consultation', value: 'Consultation' },
  { label: 'Custom Category', value: 'Custom Category' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
];

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Completed', value: 'COMPLETED' },
];

export const TaskForm: React.FC = () => {
  const navigate = useAppNavigate();
  const { id } = useAppParams();
  const isEditMode = Boolean(id);

  const [clients, setClients] = useState<{label: string, value: string}[]>([]);
  const [employees, setEmployees] = useState<{label: string, value: string}[]>([]);
  const [departments, setDepartments] = useState<{label: string, value: string}[]>([]);
  const [isArchived, setIsArchived] = useState(false);

  const methods = useForm<any>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskName: '',
      clientId: '',
      departmentId: '',
      managerId: '',
      employeeIds: [],
      category: 'GST Return',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '',
      startDate: '',
      description: '',
      instructions: '',
      checklist: []
    }
  });

  const { handleSubmit, reset, formState: { isSubmitting }, control, watch } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "checklist"
  });

  useEffect(() => {
    Promise.all([
      clientService.getAll(),
      employeeService.getAll(),
      departmentService.getAll()
    ]).then(([clientData, employeeData, deptData]) => {
      setClients(clientData.filter(c => !c.isArchived).map(c => ({ label: `${c.clientName} (${c.clientCode})`, value: c.id })));
      setEmployees(employeeData.filter(e => !e.isArchived).map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e.id })));
      setDepartments(deptData.filter(d => !d.isArchived).map(d => ({ label: d.name, value: d.id })));
    });

    if (isEditMode && id) {
      taskService.getById(id).then(task => {
        if (task) {
          setIsArchived(task.isArchived);
          reset({
            ...task,
            startDate: task.startDate || '',
            dueDate: task.dueDate || '',
          });
        }
      });
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && id) {
        await taskService.update(id, data);
        toast.success('Task updated successfully');
      } else {
        await taskService.create(data);
        toast.success('Task created successfully');
      }
      navigate('/tasks');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  if (isArchived) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">This Task is Archived</h2>
          <p className="text-gray-500 mb-6">Archived tasks cannot be edited. Restore it first to make changes.</p>
          <Button onClick={() => navigate('/tasks')}>Back to Tasks</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={isEditMode ? 'Edit Task' : 'Create New Task'}
        description="Assign and track work for clients"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Tasks', path: '/tasks' },
          { label: isEditMode ? 'Edit' : 'New' }
        ]}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                 <FormInput name="taskName" label="Task Name" placeholder="e.g. FY 24-25 Audit for Acme Corp" />
              </div>
              <FormSelect name="clientId" label="Client" options={clients} />
              <FormSelect name="category" label="Category" options={CATEGORY_OPTIONS} />
              
              <FormSelect name="priority" label="Priority" options={PRIORITY_OPTIONS} />
              <FormSelect name="status" label="Status" options={STATUS_OPTIONS} />
              
              <FormInput name="startDate" label="Start Date (Optional)" type="date" />
              <FormInput name="dueDate" label="Due Date" type="date" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Assignment & Routing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect name="departmentId" label="Routing Department (Optional)" options={departments} />
              <FormSelect name="managerId" label="Assigned Manager (Optional)" options={employees} />
              
              <div className="md:col-span-2">
                <FormSelect 
                  name="employeeIds" 
                  label="Assigned Team Members" 
                  options={employees} 
                  multiple // Note: Requires extending FormSelect to handle arrays/multiple or just a mock fallback
                  helperText="Hold Ctrl/Cmd to select multiple members (if supported) or pick one. In a real app this would be a multi-select chip input."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Details & Instructions</h3>
            <div className="grid grid-cols-1 gap-4">
              <FormTextarea name="description" label="Task Description" placeholder="Overview of the work to be done..." />
              <FormTextarea name="instructions" label="Special Instructions" placeholder="Specific steps, logins, or warnings for the assignee..." />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
               <h3 className="text-lg font-bold text-gray-900">Task Checklist</h3>
               <Button type="button" variant="outline" size="sm" onClick={() => append({ id: uuidv4(), title: '', isCompleted: false })} className="flex items-center gap-2">
                 <Plus size={16} /> Add Item
               </Button>
            </div>
            
            {fields.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No checklist items added. Click "Add Item" to create one.</p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-3 group">
                    <div className="pt-2">
                       <input 
                         type="checkbox" 
                         className="rounded text-primary border-gray-300 focus:ring-primary" 
                         disabled
                       />
                    </div>
                    <div className="flex-1">
                      <FormInput name={`checklist.${index}.title`} placeholder="E.g. Collect PAN Card from Client" label="" />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => remove(index)}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded mt-1 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Task' : 'Create Task')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </PageContainer>
  );
};

export default TaskForm;
