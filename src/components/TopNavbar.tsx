import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Bell, Search, LogOut, User, Check, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { settingsService } from '@/services/SettingsService';

export const TopNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [firmName, setFirmName] = useState(() => settingsService.getSettings().firmProfile.firmName);

  React.useEffect(() => {
    const handleSettingsUpdate = () => {
      setFirmName(settingsService.getSettings().firmProfile.firmName);
    };
    window.addEventListener('corestack:settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('corestack:settings_updated', handleSettingsUpdate);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    
    const primarySegment = segments[0];
    return primarySegment.charAt(0).toUpperCase() + primarySegment.substring(1).replace(/-/g, ' ');
  };

  return (
    <header className="h-16 bg-[var(--color-card)] border-b border-gray-200 shadow-sm flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 overflow-hidden pr-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2 truncate">
          <span className="truncate hidden sm:inline">{firmName}</span>
          <span className="text-gray-300 hidden sm:inline">/</span> 
          <span className="truncate">{getPageTitle()}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white w-64 transition-all"
          />
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-danger text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-screen max-w-[320px] sm:max-w-sm sm:w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="font-bold text-sm text-gray-900">Notifications</span>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{unreadCount} New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">No notifications</div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div 
                      key={n.id} 
                      className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${n.status === 'UNREAD' ? 'bg-blue-50/30' : ''}`}
                      onClick={() => {
                        if (n.status === 'UNREAD') markAsRead(n.id);
                        setShowNotifications(false);
                        if (n.actionUrl) navigate(n.actionUrl);
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold ${n.priority === 'CRITICAL' ? 'text-danger' : n.priority === 'HIGH' ? 'text-warning' : 'text-primary'}`}>
                          {n.type}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm ${n.status === 'UNREAD' ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div 
                className="p-2 text-center text-xs font-bold text-primary hover:bg-gray-50 cursor-pointer border-t border-gray-100"
                onClick={() => {
                  setShowNotifications(false);
                  navigate('/notifications');
                }}
              >
                View All Notifications
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-l pl-3 sm:pl-6 border-gray-200">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="group relative">
            <button className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-white overflow-hidden shadow-sm">
              {user?.avatar ? (
                <img src={user.avatar} alt="User" className="h-full w-full object-cover" />
              ) : (
                <User size={18} />
              )}
            </button>
            
            {/* Simple Dropdown on hover for prototype */}
            <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
              <div className="bg-white rounded-default shadow-lg border border-gray-100 py-1">
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
