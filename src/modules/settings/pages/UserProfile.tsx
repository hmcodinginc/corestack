import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { employeeService } from '@/services/EmployeeService';
import { toast } from 'react-hot-toast';
import { User, Save } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, login } = useAuth();
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: any) => {
    if (!user) return;
    try {
      // Because employee is the source of truth for user profile
      const updated = await employeeService.update(user.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
      
      // Update auth context state to reflect changes in navbar immediately
      await login(user.email, 'password123'); // Fake re-login to update context, or a custom update context function
      reset(data);
      toast.success('Profile updated successfully');
      window.dispatchEvent(new CustomEvent('corestack:settings_updated'));
    } catch (e: any) {
      toast.error(e.message || 'Update failed');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User size={20} className="text-primary" /> My Profile
          </h2>
          <p className="text-sm text-gray-500">Manage your personal account details.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty} className="flex items-center gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">First Name</label>
              <input {...register('firstName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Last Name</label>
              <input {...register('lastName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </form>

        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4">Role & Access (Read Only)</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assigned Role</label>
                {(user as any)?.roleName || 'No Role'}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Department</label>
                {(user as any)?.departmentId || 'Unassigned'}
            </div>
            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              To change your role or permissions, contact your Firm Administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
