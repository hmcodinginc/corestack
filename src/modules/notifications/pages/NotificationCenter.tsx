import React, { useState } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { CheckCheck, Trash2, Filter, Search, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const NotificationCenter: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotification();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user && (user.hierarchyLevel ? user.hierarchyLevel <= 3 : ['Owner', 'Partner', 'Manager'].some(role => user.role?.includes(role)));

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return n.status === 'UNREAD';
    if (filter === 'READ') return n.status === 'READ';
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Notification Center"
        description="View and manage your alerts and reminders."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Notifications' }]}
        action={
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Button variant="outline" onClick={() => navigate('/notifications/clients')} className="bg-primary/5 text-primary border-primary/20">Client Broadcast</Button>
                <Button variant="outline" onClick={() => navigate('/notifications/preferences')}>Preferences</Button>
              </>
            )}
            <Button onClick={markAllAsRead} className="flex items-center gap-2">
              <CheckCheck size={16} /> Mark All as Read
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden min-h-[500px]">
        {/* Sidebar Filters */}
        <div className="w-64 border-r border-gray-100 p-4 hidden md:block bg-gray-50">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Status</h3>
           <div className="space-y-1 mb-8">
             <button 
               onClick={() => setFilter('ALL')}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${filter === 'ALL' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
             >
               All Notifications
             </button>
             <button 
               onClick={() => setFilter('UNREAD')}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${filter === 'UNREAD' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
             >
               Unread
             </button>
             <button 
               onClick={() => setFilter('READ')}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${filter === 'READ' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
             >
               Read
             </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
             <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search notifications..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary" />
             </div>
             <Button variant="outline" size="sm" className="flex items-center gap-2"><Filter size={14}/> Filter</Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
             {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Bell size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">You're all caught up!</p>
                </div>
             ) : (
                <div className="space-y-3">
                   {filteredNotifications.map(n => (
                     <div 
                       key={n.id} 
                       className={`p-4 rounded-xl border transition-shadow hover:shadow-sm ${n.status === 'UNREAD' ? 'bg-white border-primary/20 shadow-sm' : 'bg-white border-gray-100 opacity-75'}`}
                     >
                       <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                               {n.status === 'UNREAD' && <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>}
                               <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${n.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : n.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                 {n.priority}
                               </span>
                               <span className="text-xs text-gray-400 font-medium">
                                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                               </span>
                             </div>
                             <h4 className={`text-sm ${n.status === 'UNREAD' ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                               {n.title}
                             </h4>
                             <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                             
                             <div className="mt-3 flex gap-2">
                               {n.actionUrl && (
                                 <Button 
                                    size="sm" 
                                    onClick={() => {
                                      markAsRead(n.id);
                                      navigate(n.actionUrl!);
                                    }}
                                 >
                                   View Details
                                 </Button>
                               )}
                               {n.status === 'UNREAD' && (
                                 <Button size="sm" variant="outline" onClick={() => markAsRead(n.id)}>Mark Read</Button>
                               )}
                             </div>
                          </div>
                          <button 
                            onClick={() => deleteNotification(n.id)}
                            className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                     </div>
                   ))}
                </div>
             )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default NotificationCenter;
