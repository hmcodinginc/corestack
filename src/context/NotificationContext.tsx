import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { AppNotification } from '@/types';
import { notificationService } from '@/services/NotificationService';
import { NotificationRuleService } from '@/services/NotificationRuleService';
import { toast } from 'react-hot-toast';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const all = await notificationService.getAllForUser(user.id);
    const unread = all.filter(n => n.status === 'UNREAD').length;
    setNotifications(all);
    setUnreadCount(unread);
  };

  useEffect(() => {
    if (user) {
      // Run background rules (e.g. overdue tasks) when user logs in/loads app
      NotificationRuleService.evaluateRules(user.id).then(() => {
        fetchNotifications();
      });
    } else {
      fetchNotifications();
    }

    // Listen to the custom browser event dispatched by NotificationService
    const handleNotify = () => {
      fetchNotifications();
    };

    window.addEventListener('corestack:notify', handleNotify);
    return () => {
      window.removeEventListener('corestack:notify', handleNotify);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    // State is automatically updated via the event listener
  };

  const markAllAsRead = async () => {
    if (user) {
      await notificationService.markAllAsRead(user.id);
    }
  };

  const deleteNotification = async (id: string) => {
    await notificationService.deleteNotification(id);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refresh: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
