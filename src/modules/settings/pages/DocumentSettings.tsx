import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { settingsService } from '@/services/SettingsService';
import { DocumentSettings as DocumentSettingsType } from '@/types/settings';
import { toast } from 'react-hot-toast';
import { FileText, Save } from 'lucide-react';

export const DocumentSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<DocumentSettingsType>();

  useEffect(() => {
    const settings = settingsService.getSettings();
    reset(settings.documents);
    setLoading(false);
  }, [reset]);

  const onSubmit = async (data: DocumentSettingsType) => {
    // Array parsing for categories
    if (typeof data.defaultDocumentCategories === 'string') {
       data.defaultDocumentCategories = (data.defaultDocumentCategories as string).split(',').map(s => s.trim());
    }
    await settingsService.updateSettings('documents', data);
    reset(data);
    toast.success('Document settings saved');
  };

  if (loading) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-primary" /> Document Settings
          </h2>
          <p className="text-sm text-gray-500">Configure file storage and expiry rules.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty} className="flex items-center gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <form className="space-y-6 max-w-2xl" onSubmit={handleSubmit(onSubmit)}>
        
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Storage Rules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Max File Size (MB)</label>
              <input type="number" {...register('maxFileSizeMB', { valueAsNumber: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Default Visibility</label>
              <select {...register('defaultDocumentVisibility')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary">
                <option value="public">Public (All Staff)</option>
                <option value="role_based">Role Based (Restricted)</option>
                <option value="private">Private (Uploader Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Document Categories (Comma Separated)</label>
            <input {...register('defaultDocumentCategories')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
          </div>

          <label className="flex items-start gap-3 mt-4">
            <input type="checkbox" {...register('versioningEnabled')} className="mt-1 w-4 h-4 text-primary rounded" />
            <div>
              <p className="text-sm font-bold text-gray-900">Enable Version Control</p>
              <p className="text-xs text-gray-500">Keep history when uploading a file with the same name.</p>
            </div>
          </label>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Expiry & Reminders</h3>
          <label className="flex items-start gap-3">
            <input type="checkbox" {...register('documentExpiryReminder')} className="mt-1 w-4 h-4 text-primary rounded" />
            <div>
              <p className="text-sm font-bold text-gray-900">Enable Expiry Reminders</p>
              <p className="text-xs text-gray-500">Automatically notify assigned managers before a document expires.</p>
            </div>
          </label>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Alert Days Before Expiry</label>
            <input type="number" {...register('defaultExpiryReminderDays', { valueAsNumber: true })} className="w-full max-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

      </form>
    </div>
  );
};

export default DocumentSettings;
