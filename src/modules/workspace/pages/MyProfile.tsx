import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Building, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

export const MyProfile: React.FC = () => {
  const { user, changePassword } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  return (
    <PageContainer>
      <PageHeader
        title="My Profile"
        description="View and update your personal information"
      />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 max-w-3xl">
        <div className="flex items-center space-x-6 mb-8">
          <div className="bg-primary/10 p-6 rounded-full text-primary">
            <User size={64} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.firstName || 'Employee Name'}</h2>
            <p className="text-gray-500">{user?.role || 'Staff Accountant'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Mail className="text-gray-400" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-500">Email Address</p>
              <p className="text-gray-900">{user?.email || 'employee@firm.com'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Phone className="text-gray-400" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              <p className="text-gray-900">+1 234 567 8900</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Building className="text-gray-400" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="text-gray-900">Audit & Assurance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <User className="text-gray-400" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-500">Employee ID</p>
              <p className="text-gray-900">EMP-2023-045</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <KeyRound size={20} className="text-primary" /> Change Password
          </h3>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary" />
            </div>
            <Button onClick={handlePasswordChange} disabled={isChangingPassword} className="w-full flex justify-center mt-2">
              {isChangingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password'}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default MyProfile;
