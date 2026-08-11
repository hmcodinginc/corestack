import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { settingsService } from '@/services/SettingsService';
import { BillingSettings as BillingSettingsType } from '@/types/settings';
import { toast } from 'react-hot-toast';
import { Receipt, Save } from 'lucide-react';

export const BillingSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<BillingSettingsType>();

  useEffect(() => {
    const settings = settingsService.getSettings();
    reset(settings.billing);
    setLoading(false);
  }, [reset]);

  const onSubmit = async (data: BillingSettingsType) => {
    await settingsService.updateSettings('billing', data);
    reset(data);
    toast.success('Billing configuration saved');
  };

  if (loading) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Receipt size={20} className="text-primary" /> Billing & Invoicing
          </h2>
          <p className="text-sm text-gray-500">Configure default tax rules and payment details.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty} className="flex items-center gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <form className="space-y-6 max-w-4xl" onSubmit={handleSubmit(onSubmit)}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Invoice Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Prefix</label>
                <input {...register('invoicePrefix')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Due Days</label>
                <input type="number" {...register('invoiceDueDays', { valueAsNumber: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Default Tax Rate (%)</label>
                <input type="number" {...register('defaultTaxRate', { valueAsNumber: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Currency</label>
                <input {...register('defaultCurrency')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase bg-gray-50" readOnly />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Number Format</label>
              <input {...register('invoiceNumberFormat')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-500 bg-gray-50" disabled />
              <p className="text-[10px] text-gray-400 mt-1">Example: INV-2026-0001</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Payment Collection</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Bank Details</label>
              <textarea {...register('bankDetails')} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none font-mono" placeholder="Bank Name:&#10;A/c No:&#10;IFSC:" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Firm UPI ID</label>
              <input {...register('upiId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Payment Instructions</label>
              <textarea {...register('paymentInstructions')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-full">
           <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Terms & Footers</h3>
           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Standard Payment Terms</label>
              <textarea {...register('paymentTerms')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Invoice Footer Text</label>
              <input {...register('invoiceFooter')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
           </div>
        </div>

      </form>
    </div>
  );
};

export default BillingSettings;
