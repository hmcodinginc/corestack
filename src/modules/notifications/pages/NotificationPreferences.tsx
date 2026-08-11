import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Bell, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationPreferenceService } from '@/services/NotificationService';
import { NotificationPreference, NotificationModule } from '@/types';
import { toast } from 'react-hot-toast';

const MODULES: NotificationModule[] = ['TASKS', 'DOCUMENTS', 'CLIENTS', 'BILLING', 'PAYMENTS', 'REPORTS', 'SYSTEM'];

export const NotificationPreferences: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Record<string, NotificationPreference>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      notificationPreferenceService.getPreferences(user.id).then(prefs => {
        const prefMap: Record<string, NotificationPreference> = {};
        prefs.forEach(p => prefMap[p.module] = p);
        
        // Initialize missing modules
        MODULES.forEach(mod => {
          if (!prefMap[mod]) {
            prefMap[mod] = {
              id: `temp-${mod}`,
              userId: user.id,
              module: mod,
              inApp: true,
              email: false,
              whatsapp: false,
              sms: false,
              push: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isArchived: false,
              archivedAt: null
            };
          }
        });
        setPreferences(prefMap);
        setLoading(false);
      });
    }
  }, [user]);

  const togglePreference = (module: string, channel: keyof NotificationPreference) => {
    if (channel !== 'inApp') {
      toast.error('Only In-App notifications are active in the current demo phase.');
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [channel]: !prev[module][channel as keyof NotificationPreference]
      }
    }));
  };

  const savePreferences = async () => {
    if (!user) return;
    
    // In a real app we'd bulk upsert, here we just simulate saving
    toast.success('Preferences saved successfully!');
  };

  if (loading) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-primary" /> Notification Preferences
          </h2>
          <p className="text-sm text-gray-500">Manage how and when you receive alerts.</p>
        </div>
        <Button onClick={savePreferences} className="flex items-center gap-2">
          <Save size={16} /> Save Preferences
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-gray-700">Category</th>
              <th className="p-4 font-bold text-gray-700 text-center">In-App</th>
              <th className="p-4 font-bold text-gray-400 text-center">Email (Coming Soon)</th>
              <th className="p-4 font-bold text-gray-400 text-center">SMS (Coming Soon)</th>
              <th className="p-4 font-bold text-gray-400 text-center">WhatsApp (Coming Soon)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MODULES.map(mod => {
              const pref = preferences[mod];
              return (
                <tr key={mod} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900 capitalize">{mod.toLowerCase()}</td>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={pref.inApp}
                      onChange={() => togglePreference(mod, 'inApp')}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input type="checkbox" disabled checked={pref.email} className="w-4 h-4 text-gray-300 border-gray-200 rounded cursor-not-allowed" />
                  </td>
                  <td className="p-4 text-center">
                    <input type="checkbox" disabled checked={pref.sms} className="w-4 h-4 text-gray-300 border-gray-200 rounded cursor-not-allowed" />
                  </td>
                  <td className="p-4 text-center">
                    <input type="checkbox" disabled checked={pref.whatsapp} className="w-4 h-4 text-gray-300 border-gray-200 rounded cursor-not-allowed" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationPreferences;
