import React, { useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { paymentSchema } from '@/schemas/billing.schema';
import { paymentService } from '@/services/BillingService';

import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId: string;
  maxAmount: number;
}

const PAYMENT_METHODS = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Card', value: 'CARD' },
  { label: 'Other', value: 'OTHER' },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, invoiceId, maxAmount }) => {
  const methods = useForm<any>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: invoiceId,
      amount: maxAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      referenceNumber: '',
      notes: ''
    }
  });

  const { handleSubmit, reset, formState: { isSubmitting }, control } = methods;

  const watchMethod = useWatch({ control, name: 'paymentMethod' });
  const isRefRequired = ['BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD'].includes(watchMethod);

  useEffect(() => {
    if (isOpen) {
      reset({
        invoiceId: invoiceId,
        amount: maxAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        referenceNumber: '',
        notes: ''
      });
    }
  }, [isOpen, invoiceId, maxAmount, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      if (data.amount > maxAmount) {
         toast.error(`Payment cannot exceed the remaining balance of ₹${maxAmount.toLocaleString()}`);
         return;
      }
      
      await paymentService.recordPayment(data);
      toast.success('Payment recorded successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-100 mb-6 flex items-center justify-between">
             <span className="font-medium">Remaining Balance</span>
             <span className="font-bold text-lg">₹{maxAmount.toLocaleString()}</span>
          </div>

          <FormProvider {...methods}>
            <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInput 
                name="amount" 
                label="Payment Amount (₹)" 
                type="number" 
                step="0.01" 
                max={maxAmount}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormInput name="paymentDate" label="Payment Date" type="date" />
                 <FormSelect name="paymentMethod" label="Payment Method" options={PAYMENT_METHODS} />
              </div>
              
              <FormInput 
                name="referenceNumber" 
                label={`Reference Number ${isRefRequired ? '*' : '(Optional)'}`} 
                placeholder="e.g. UTR / Cheque No." 
              />
              <FormTextarea name="notes" label="Notes (Optional)" placeholder="Any internal notes about this payment..." />
            </form>
          </FormProvider>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form" disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Record Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
};
