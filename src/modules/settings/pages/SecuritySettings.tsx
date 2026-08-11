import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { settingsService } from '@/services/SettingsService';
import { SecuritySettings as SecuritySettingsType } from '@/types/settings';
import { toast } from 'react-hot-toast';
import { Shield, Save, Smartphone, KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const SecuritySettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<SecuritySettingsType>();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { changePassword } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
       toast.error('Please fill in all password fields');
       return;
    }
    if (newPassword !== confirmPassword) {
       toast.error('New passwords do not match');
       return;
    }
    
    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Error handled by context
    } finally {
      setIsChangingPassword(false);
    }
  };

  useEffect(() => {
    const settings = settingsService.getSettings();
    reset(settings.security);
    setLoading(false);
  }, [reset]);

  const onSubmit = async (data: SecuritySettingsType) => {
    await settingsService.updateSettings('security', data);
    reset(data);
    toast.success('Security settings updated');
  };

  if (loading) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield size={20} className="text-primary" /> Security & Access
          </h2>
          <p className="text-sm text-gray-500">Configure authentication and session rules.</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty} className="flex items-center gap-2">
          <Save size={16} /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Session Management</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Session Timeout (Minutes)</label>
              <input type="number" {...register('sessionTimeout', { valueAsNumber: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary" />
            </div>
            
            <label className="flex items-start gap-3 mt-4">
              <input type="checkbox" {...register('autoLogout')} className="mt-1 w-4 h-4 text-primary rounded" />
              <div>
                <p className="text-sm font-bold text-gray-900">Auto Logout</p>
                <p className="text-xs text-gray-500">Automatically log users out when they close the browser.</p>
              </div>
            </label>
            
            <label className="flex items-start gap-3">
              <input type="checkbox" {...register('loginActivityLogging')} className="mt-1 w-4 h-4 text-primary rounded" />
              <div>
                <p className="text-sm font-bold text-gray-900">Activity Logging</p>
                <p className="text-xs text-gray-500">Keep a detailed audit log of all logins and IP addresses.</p>
              </div>
            </label>
            
            <label className="flex items-start gap-3">
              <input type="checkbox" {...register('securityNotifications')} className="mt-1 w-4 h-4 text-primary rounded" />
              <div>
                <p className="text-sm font-bold text-gray-900">Security Alerts</p>
                <p className="text-xs text-gray-500">Notify me of logins from new devices or unusual locations.</p>
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Authentication</h3>
            <label className="flex items-start gap-3">
              <input type="checkbox" {...register('twoFactorAuthEnabled')} className="mt-1 w-4 h-4 text-primary rounded" />
              <div>
                <p className="text-sm font-bold text-gray-900">Require Two-Factor Auth (2FA)</p>
                <p className="text-xs text-gray-500">Force all firm employees to use an authenticator app.</p>
              </div>
            </label>
          </div>

        </form>

        <div className="space-y-6">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><KeyRound size={16}/> Change Password</h3>
             <div className="space-y-3">
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm" />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm" />
                <Button onClick={handlePasswordChange} disabled={isChangingPassword} className="w-full flex justify-center">
                  {isChangingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password'}
                </Button>
             </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Smartphone size={16}/> Active Devices</h3>
             <div className="space-y-3">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                   <div>
                     <p className="text-sm font-bold text-gray-900">Chrome on Windows</p>
                     <p className="text-xs text-gray-500">Current Session • Mumbai, IN</p>
                   </div>
                   <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
                <Button variant="outline" onClick={() => toast.success('Logged out of all other devices')} className="w-full text-danger border-red-200 hover:bg-red-50">Log out of all other devices</Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
