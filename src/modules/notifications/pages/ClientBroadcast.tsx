import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { clientService } from '@/services/ClientService';
import { communicationService } from '@/services/NotificationService';
import { Client } from '@/types/client';
import { Button } from '@/components/ui/Button';
import { Send, MessageSquare, Smartphone, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ClientBroadcast: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [notifyType, setNotifyType] = useState('Income Tax Due');
  const [message, setMessage] = useState('Dear Client, your Income Tax Return is due shortly. Please provide the necessary documents.');
  const [channels, setChannels] = useState({ whatsapp: true, sms: true, email: false });

  useEffect(() => {
    clientService.getAll().then(setClients);
  }, []);

  const openNotifyModal = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleSend = async () => {
    if (!selectedClient) return;

    const activeChannels = [];
    if (channels.whatsapp) activeChannels.push('WHATSAPP');
    if (channels.sms) activeChannels.push('SMS');
    if (channels.email) activeChannels.push('EMAIL');

    if (activeChannels.length === 0) {
      toast.error('Please select at least one channel (WhatsApp, SMS, Email)');
      return;
    }

    // Log the communication for each channel
    for (const channel of activeChannels) {
      await communicationService.logCommunication(
        selectedClient.id,
        channel as any,
        notifyType,
        message,
        selectedClient.id,
        selectedClient.id
      );
    }

    // Actually trigger the OS/Web apps if a mobile number is present
    const cleanMobile = selectedClient.mobile ? selectedClient.mobile.replace(/\D/g, '') : '';
    
    if (cleanMobile) {
      if (channels.whatsapp) {
        const waUrl = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      }
      
      if (channels.sms) {
        const smsUrl = `sms:${cleanMobile}?body=${encodeURIComponent(message)}`;
        // Use a slight delay if both are checked to avoid popup blocking
        setTimeout(() => {
          window.open(smsUrl, '_self');
        }, channels.whatsapp ? 500 : 0);
      }
      
      if (channels.email && selectedClient.email) {
        const mailUrl = `mailto:${selectedClient.email}?subject=${encodeURIComponent(notifyType)}&body=${encodeURIComponent(message)}`;
        setTimeout(() => {
          window.open(mailUrl, '_self');
        }, (channels.whatsapp || channels.sms) ? 1000 : 0);
      }
    } else {
      toast.error('Client does not have a valid mobile number for WhatsApp/SMS.');
    }

    toast.success(`Notification sent to ${selectedClient.clientName} via ${activeChannels.join(' & ')}!`);
    setIsModalOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Client Notifications"
        description="Broadcast messages, payment links, and document requests to your clients."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Notifications', path: '/notifications' }, { label: 'Client Broadcast' }]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-gray-700">Client Code</th>
              <th className="p-4 font-bold text-gray-700">Client Name</th>
              <th className="p-4 font-bold text-gray-700">Contact Number</th>
              <th className="p-4 font-bold text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.length === 0 ? (
               <tr>
                 <td colSpan={4} className="p-8 text-center text-gray-500">No clients found. Add clients to send notifications.</td>
               </tr>
            ) : (
               clients.map(client => (
                 <tr key={client.id} className="hover:bg-gray-50">
                   <td className="p-4 font-mono font-bold text-gray-900">{client.clientCode}</td>
                   <td className="p-4 font-medium text-gray-800">{client.clientName}</td>
                   <td className="p-4 text-gray-600 font-mono">{client.mobile || 'No Mobile'}</td>
                   <td className="p-4 text-right">
                      <Button size="sm" onClick={() => openNotifyModal(client)} className="flex items-center gap-2 ml-auto">
                        <Send size={14} /> Notify
                      </Button>
                   </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Send size={20} className="text-primary" /> Notify Client
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex gap-3 border border-blue-100">
                <AlertCircle size={20} className="shrink-0" />
                <p>Sending to: <strong>{selectedClient.clientName}</strong> ({selectedClient.mobile})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Notification Type</label>
                <select 
                  value={notifyType} 
                  onChange={(e) => setNotifyType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="Income Tax Due">Income Tax Due</option>
                  <option value="GST Return Due">GST Return Due</option>
                  <option value="Send Documents Required">Send Documents Required</option>
                  <option value="Payment Follow-up">Payment Follow-up</option>
                  <option value="Custom Message">Custom Message</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Message Content</label>
                <textarea 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Delivery Channels</label>
                <div className="flex gap-6">
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={channels.whatsapp} onChange={e => setChannels(c => ({...c, whatsapp: e.target.checked}))} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-600" />
                     <MessageSquare size={16} className={channels.whatsapp ? 'text-green-600' : 'text-gray-400'} />
                     <span className="text-sm font-medium">WhatsApp</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={channels.sms} onChange={e => setChannels(c => ({...c, sms: e.target.checked}))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600" />
                     <Smartphone size={16} className={channels.sms ? 'text-blue-600' : 'text-gray-400'} />
                     <span className="text-sm font-medium">SMS</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={channels.email} onChange={e => setChannels(c => ({...c, email: e.target.checked}))} className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
                     <Mail size={16} className={channels.email ? 'text-orange-600' : 'text-gray-400'} />
                     <span className="text-sm font-medium">Email</span>
                   </label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSend} className="flex items-center gap-2"><Send size={16} /> Send Notification</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default ClientBroadcast;
