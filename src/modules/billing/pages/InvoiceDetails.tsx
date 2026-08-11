import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IndianRupee, Calendar, FileText, Download, Printer, CheckCircle2, History, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { downloadDummyFile } from '@/utils/downloadUtils';

import { Invoice, Payment } from '@/types/billing';
import { invoiceService, paymentService } from '@/services/BillingService';
import { clientService } from '@/services/ClientService';

import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { PaymentModal } from '../components/PaymentModal';

export const InvoiceDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clientName, setClientName] = useState('Loading...');
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    const inv = await invoiceService.getById(id);
    if (!inv) {
      navigate('/billing');
      return;
    }
    setInvoice(inv);
    
    const c = await clientService.getById(inv.clientId);
    if (c) setClientName(c.clientName);
    
    const allPayments = await paymentService.getAll();
    setPayments(allPayments.filter(p => p.invoiceId === inv.id && !p.isArchived).sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()));
  };

  useEffect(() => {
    loadData();
  }, [id, navigate]);

  const handleConvert = async () => {
    if (!invoice) return;
    try {
      await invoiceService.update(invoice.id, { type: 'INVOICE', status: 'SENT' });
      toast.success('Quotation converted to Invoice successfully!');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to convert');
    }
  };

  if (!invoice) return null;

  const isQuotation = invoice.type === 'QUOTATION';
  const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.balanceAmount > 0 && invoice.status !== 'PAID';

  return (
    <PageContainer>
      <PageHeader
        title={`${isQuotation ? 'Quotation' : 'Invoice'} Details`}
        description={invoice.invoiceNumber}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Billing', path: '/billing' },
          { label: invoice.invoiceNumber }
        ]}
        action={
          <div className="flex items-center gap-3">
             <Button variant="outline" onClick={() => toast.success('Demo: Print dialog opened')}>
               <Printer size={16} className="mr-2" /> Print
             </Button>
             <Button variant="outline" onClick={() => {
                downloadDummyFile(`invoice_${invoice.invoiceNumber}.pdf`, `Dummy PDF Content for Invoice ${invoice.invoiceNumber}`);
                toast.success('Download started');
              }}>
               <Download size={16} className="mr-2" /> Download
             </Button>
             {isQuotation && !invoice.isArchived && (
               <Button onClick={handleConvert}>
                 Convert to Invoice
               </Button>
             )}
             {!isQuotation && invoice.balanceAmount > 0 && !invoice.isArchived && (
               <Button onClick={() => setIsPaymentModalOpen(true)}>
                 <IndianRupee size={16} className="mr-2" /> Record Payment
               </Button>
             )}
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Invoice Document */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
           {/* Header row */}
           <div className="flex items-start justify-between border-b border-gray-100 pb-6 mb-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{isQuotation ? 'QUOTATION' : 'INVOICE'}</h2>
                <p className="text-gray-500 font-mono mt-1">{invoice.invoiceNumber}</p>
                <div className="mt-4"><StatusBadge status={invoice.status} /></div>
                {isOverdue && !isQuotation && (
                   <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded mt-2">
                     <AlertCircle size={12} /> OVERDUE
                   </span>
                )}
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-primary">CoreStack Firm</h3>
                <p className="text-sm text-gray-500 mt-1">123 Financial Tower, NY 10001</p>
                <p className="text-sm text-gray-500">contact@corestack.demo</p>
              </div>
           </div>

           {/* Client & Dates */}
           <div className="flex justify-between mb-8">
              <div>
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Billed To</p>
                 <h4 className="text-base font-bold text-gray-900">{clientName}</h4>
              </div>
              <div className="text-right flex gap-12">
                 <div>
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{isQuotation ? 'Date' : 'Invoice Date'}</p>
                   <p className="text-sm font-medium text-gray-900">{format(new Date(invoice.billingDate), 'MMM dd, yyyy')}</p>
                 </div>
                 <div>
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{isQuotation ? 'Valid Until' : 'Due Date'}</p>
                   <p className="text-sm font-medium text-gray-900">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
                 </div>
              </div>
           </div>

           {/* Line Items */}
           <table className="w-full mb-8">
              <thead>
                 <tr className="border-b-2 border-gray-200">
                    <th className="py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                    <th className="py-3 text-right text-xs font-bold text-gray-500 uppercase">Qty</th>
                    <th className="py-3 text-right text-xs font-bold text-gray-500 uppercase">Rate</th>
                    <th className="py-3 text-right text-xs font-bold text-gray-500 uppercase">Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {invoice.items.map(item => (
                   <tr key={item.id}>
                      <td className="py-4 text-sm text-gray-900 font-medium">{item.description}</td>
                      <td className="py-4 text-sm text-gray-600 text-right">{item.quantity}</td>
                      <td className="py-4 text-sm text-gray-600 text-right font-mono">₹{item.rate.toLocaleString()}</td>
                      <td className="py-4 text-sm text-gray-900 text-right font-mono font-medium">₹{item.amount.toLocaleString()}</td>
                   </tr>
                 ))}
              </tbody>
           </table>

           {/* Totals */}
           <div className="flex justify-end border-t border-gray-100 pt-6">
              <div className="w-64 space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-mono text-gray-900">₹{invoice.subtotal.toLocaleString()}</span>
                 </div>
                 {invoice.discountAmount > 0 && (
                   <div className="flex justify-between text-sm text-red-600">
                      <span>Discount ({invoice.discountPercentage}%)</span>
                      <span className="font-mono">- ₹{invoice.discountAmount.toLocaleString()}</span>
                   </div>
                 )}
                 {invoice.taxAmount > 0 && (
                   <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax/GST ({invoice.taxPercentage}%)</span>
                      <span className="font-mono">+ ₹{invoice.taxAmount.toLocaleString()}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-3">
                    <span className="text-gray-900">Total</span>
                    <span className="font-mono text-primary">₹{invoice.totalAmount.toLocaleString()}</span>
                 </div>
                 
                 {!isQuotation && (
                   <>
                     <div className="flex justify-between text-sm text-green-600 border-t border-gray-200 pt-3 mt-3">
                        <span>Amount Paid</span>
                        <span className="font-mono">- ₹{invoice.paidAmount.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-base font-bold bg-gray-50 p-2 rounded mt-2">
                        <span className="text-gray-900">Balance Due</span>
                        <span className="font-mono text-gray-900">₹{invoice.balanceAmount.toLocaleString()}</span>
                     </div>
                   </>
                 )}
              </div>
           </div>

           {/* Notes */}
           {(invoice.notes || invoice.terms) && (
             <div className="border-t border-gray-100 mt-8 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                {invoice.notes && (
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Notes</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Terms & Conditions</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
                  </div>
                )}
             </div>
           )}
        </div>

        {/* Sidebar */}
        {!isQuotation && (
          <div className="space-y-6">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                   <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                     <History size={16} /> Payment History
                   </h3>
                </div>
                
                {payments.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                     <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                     <p className="text-sm">No payments recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {payments.map(payment => (
                       <div key={payment.id} className="relative pl-4 border-l-2 border-green-200">
                          <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-green-500" />
                          <div className="flex justify-between items-start mb-1">
                             <p className="text-sm font-bold text-gray-900 font-mono">₹{payment.amount.toLocaleString()}</p>
                             <p className="text-xs text-gray-500">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
                          </div>
                          <p className="text-xs font-medium text-gray-600 bg-gray-100 inline-block px-1.5 py-0.5 rounded">
                            {payment.paymentMethod}
                          </p>
                          {payment.referenceNumber && (
                             <p className="text-xs text-gray-500 mt-1">Ref: {payment.referenceNumber}</p>
                          )}
                       </div>
                     ))}
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={loadData}
        invoiceId={invoice.id}
        maxAmount={invoice.balanceAmount}
      />
    </PageContainer>
  );
};

export default InvoiceDetails;
