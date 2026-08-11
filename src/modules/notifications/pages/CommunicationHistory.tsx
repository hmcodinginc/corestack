import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { communicationService } from '@/services/NotificationService';
import { CommunicationLog } from '@/types';
import { format } from 'date-fns';

export const CommunicationHistory: React.FC = () => {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);

  useEffect(() => {
    communicationService.getAll().then(setLogs);
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Communication History"
        description="Audit log of all system messages and external communications."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Notifications', path: '/notifications' }, { label: 'History' }]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
             No communications have been logged yet.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold text-gray-700">Date</th>
                <th className="p-4 font-bold text-gray-700">Channel</th>
                <th className="p-4 font-bold text-gray-700">Subject</th>
                <th className="p-4 font-bold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(l => (
                <tr key={l.id}>
                  <td className="p-4 text-gray-600">{format(new Date(l.date), 'MMM dd, yyyy HH:mm')}</td>
                  <td className="p-4"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-bold">{l.channel}</span></td>
                  <td className="p-4 font-medium text-gray-900">{l.subject}</td>
                  <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageContainer>
  );
};

export default CommunicationHistory;
