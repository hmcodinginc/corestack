import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { settingsService } from '@/services/SettingsService';
import { AppearanceSettings as AppearanceSettingsType } from '@/types/settings';
import { toast } from 'react-hot-toast';
import { Palette, Save, Moon, Sun, Monitor } from 'lucide-react';

export const AppearanceSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, watch, formState: { isDirty } } = useForm<AppearanceSettingsType>();
  
  const theme = watch('theme');

  useEffect(() => {
    const settings = settingsService.getSettings();
    reset(settings.appearance);
    setLoading(false);
  }, [reset]);

  const onSubmit = async (data: AppearanceSettingsType) => {
    await settingsService.updateSettings('appearance', data);
    reset(data); // reset isDirty
    toast.success('Appearance settings updated');
  };

  if (loading) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Palette size={20} className="text-primary" /> Appearance
          </h2>
          <p className="text-sm text-gray-500">Customize the look and feel of your workspace.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty} className="flex items-center gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <form className="space-y-8 max-w-2xl" onSubmit={handleSubmit(onSubmit)}>
        
        {/* Theme Selection */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Theme Preference</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" value="light" {...register('theme')} className="hidden" />
              <Sun size={24} className={theme === 'light' ? 'text-primary' : 'text-gray-400'} />
              <span className={`mt-2 text-sm font-medium ${theme === 'light' ? 'text-primary' : 'text-gray-600'}`}>Light</span>
            </label>
            <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" value="dark" {...register('theme')} className="hidden" />
              <Moon size={24} className={theme === 'dark' ? 'text-primary' : 'text-gray-400'} />
              <span className={`mt-2 text-sm font-medium ${theme === 'dark' ? 'text-primary' : 'text-gray-600'}`}>Dark</span>
            </label>
            <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" value="system" {...register('theme')} className="hidden" />
              <Monitor size={24} className={theme === 'system' ? 'text-primary' : 'text-gray-400'} />
              <span className={`mt-2 text-sm font-medium ${theme === 'system' ? 'text-primary' : 'text-gray-600'}`}>System</span>
            </label>
          </div>
        </div>



        {/* Density & Layout */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Layout Density</h3>
          <div>
            <select {...register('density')} className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary">
              <option value="comfortable">Comfortable (Default)</option>
              <option value="compact">Compact (More data per screen)</option>
            </select>
          </div>
        </div>

      </form>
    </div>
  );
};

export default AppearanceSettings;
