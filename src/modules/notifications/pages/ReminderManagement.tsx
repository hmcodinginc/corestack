import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { reminderService } from '@/services/NotificationService';
import { Reminder } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

export const ReminderManagement: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (user) {
      reminderService.getActiveRemindersForUser(user.id).then(setReminders);
    }
  }, [user]);

  return (
    <PageContainer>
      <PageHeader
        title="My Reminders"
        description="View and manage your scheduled follow-ups."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Notifications', path: '/notifications' }, { label: 'Reminders' }]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {reminders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
             No active reminders. Reminders are generated automatically based on system rules (e.g. Document Expiry).
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold text-gray-700">Message</th>
                <th className="p-4 font-bold text-gray-700">Type</th>
                <th className="p-4 font-bold text-gray-700">Date/Time</th>
                <th className="p-4 font-bold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reminders.map(r => (
                <tr key={r.id}>
                  <td className="p-4 font-medium text-gray-900">{r.message}</td>
                  <td className="p-4 text-gray-600">{r.type}</td>
                  <td className="p-4 text-gray-600">{format(new Date(r.reminderDate), 'MMM dd, yyyy')} {r.reminderTime}</td>
                  <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageContainer>
  );
};

export default ReminderManagement;
