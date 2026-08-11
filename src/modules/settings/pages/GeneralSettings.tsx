import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { settingsService } from '@/services/SettingsService';
import { GeneralSettings as GeneralSettingsType } from '@/types/settings';
import { toast } from 'react-hot-toast';
import { Settings, Save } from 'lucide-react';

export const GeneralSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<GeneralSettingsType>();

  useEffect(() => {
    const settings = settingsService.getSettings();
    reset(settings.general);
    setLoading(false);
  }, [reset]);

  const onSubmit = async (data: GeneralSettingsType) => {
    await settingsService.updateSettings('general', data);
    reset(data);
    toast.success('General settings updated');
  };

  if (loading) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings size={20} className="text-primary" /> General Settings
          </h2>
          <p className="text-sm text-gray-500">Configure global application defaults.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty} className="flex items-center gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <form className="space-y-6 max-w-3xl" onSubmit={handleSubmit(onSubmit)}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Localization</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Timezone</label>
              <select {...register('timezone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary">
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Currency</label>
              <select {...register('currency')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary">
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Date Format</label>
                <select {...register('dateFormat')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary">
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Time Format</label>
                <select {...register('timeFormat')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary">
                  <option value="12h">12-hour (1:00 PM)</option>
                  <option value="24h">24-hour (13:00)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Business Rules</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Financial Year</label>
              <select {...register('financialYear')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary">
                <option value="April-March">April - March (India)</option>
                <option value="Jan-Dec">January - December</option>
                <option value="July-June">July - June</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">First Day of Week</label>
              <select {...register('firstDayOfWeek')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary">
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Default Pagination Size</label>
              <select {...register('defaultPaginationSize', { valueAsNumber: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary">
                <option value={10}>10 records per page</option>
                <option value={25}>25 records per page</option>
                <option value={50}>50 records per page</option>
                <option value={100}>100 records per page</option>
              </select>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default GeneralSettings;
