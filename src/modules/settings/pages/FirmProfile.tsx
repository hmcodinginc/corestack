import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { settingsService } from '@/services/SettingsService';
import { FirmProfile as FirmProfileType } from '@/types/settings';
import { toast } from 'react-hot-toast';
import { Building2, Save } from 'lucide-react';

export const FirmProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isDirty, errors } } = useForm<FirmProfileType>();

  useEffect(() => {
    const settings = settingsService.getSettings();
    reset(settings.firmProfile);
    setLoading(false);
  }, [reset]);

  const onSubmit = async (data: FirmProfileType) => {
    await settingsService.updateSettings('firmProfile', data);
    reset(data); // reset isDirty
    toast.success('Firm Profile updated successfully');
  };

  if (loading) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={20} className="text-primary" /> Firm Profile
          </h2>
          <p className="text-sm text-gray-500">Manage your firm's public and billing details.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty} className="flex items-center gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <form className="space-y-6 max-w-4xl" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Basic Information</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Firm Name *</label>
              <input {...register('firmName', { required: 'Firm name is required' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              {errors.firmName && <span className="text-xs text-danger">{errors.firmName.message}</span>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Firm Type</label>
              <select {...register('firmType')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="Proprietorship">Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="LLP">LLP</option>
                <option value="Private Limited">Private Limited</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">PAN</label>
                <input {...register('pan')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">GSTIN</label>
                <input {...register('gstin')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Registration Number</label>
              <input {...register('registrationNumber')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Contact & Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email</label>
                <input type="email" {...register('email')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone</label>
                <input {...register('phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Website</label>
              <input {...register('website')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Address</label>
              <textarea {...register('address')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">City</label>
                <input {...register('city')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">State</label>
                <input {...register('state')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Pincode</label>
                <input {...register('pincode')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FirmProfile;
