import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export const MyCalendar: React.FC = () => {
  const [upcomingDeadlines] = useState([
    { id: 1, title: 'Q3 Tax Filing for Acme Corp', date: '2023-10-15', time: '17:00' },
    { id: 2, title: 'Audit Report Submission', date: '2023-10-20', time: '12:00' },
    { id: 3, title: 'Client Meeting - Globex', date: '2023-10-22', time: '14:30' },
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="My Calendar"
        description="Upcoming deadlines and events"
      />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <CalendarIcon className="mr-2" size={20} /> Upcoming Deadlines
        </h2>
        
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-4">
            {upcomingDeadlines.map((item) => (
              <div key={item.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="bg-primary/10 text-primary p-3 rounded-full mr-4">
                  <Clock size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <div className="flex text-sm text-gray-500 mt-1 space-x-4">
                    <span>{item.date}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No upcoming deadlines.</p>
        )}
      </div>
    </PageContainer>
  );
};

export default MyCalendar;
