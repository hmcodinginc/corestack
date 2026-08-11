import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { notificationTemplateService } from '@/services/NotificationService';
import { NotificationTemplate } from '@/types';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

export const NotificationTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);

  useEffect(() => {
    notificationTemplateService.getAll().then(setTemplates);
  }, []);

  const runSeed = async () => {
    await notificationTemplateService.create({
      templateName: 'Task Overdue Template',
      type: 'Task Overdue',
      titleTemplate: 'Task Overdue: {{taskName}}',
      messageTemplate: 'This task was due on {{dueDate}}. Please take action.',
      module: 'TASKS',
      status: 'ACTIVE'
    });
    const all = await notificationTemplateService.getAll();
    setTemplates(all);
    toast.success('Seed template generated');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Notification Templates"
        description="Manage message variables and formats for automated alerts."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Notifications', path: '/notifications' }, { label: 'Templates' }]}
        action={<Button onClick={runSeed}>+ Create Template</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {templates.length === 0 ? (
           <div className="col-span-full p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
             No templates found. Click "Create Template" to seed default templates.
           </div>
         ) : (
           templates.map(t => (
             <div key={t.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-3">
                 <h3 className="font-bold text-gray-900">{t.templateName}</h3>
                 <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded">{t.status}</span>
               </div>
               <p className="text-xs text-gray-500 mb-2"><strong>Module:</strong> {t.module}</p>
               <div className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100 mb-2">
                 <p className="font-bold text-gray-700">{t.titleTemplate}</p>
               </div>
               <div className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                 <p className="text-gray-600">{t.messageTemplate}</p>
               </div>
             </div>
           ))
         )}
      </div>
    </PageContainer>
  );
};

export default NotificationTemplates;
