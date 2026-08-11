import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, Key, Users } from 'lucide-react';

export const PermissionSettings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Key size={20} className="text-primary" /> Role & Permission Settings
        </h2>
        <p className="text-sm text-gray-500">Manage access controls and functional privileges.</p>
      </div>

      <div className="max-w-2xl bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Centralized Access Control</h3>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-md mx-auto">
          Roles and Permissions are managed through the dedicated Access Control Module. This ensures strict separation of duties and prevents accidental privilege escalation.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/roles')} className="flex items-center gap-2" variant="default">
            <Key size={16} /> Manage Roles & Permissions
          </Button>
          <Button onClick={() => navigate('/employees')} className="flex items-center gap-2" variant="outline">
            <Users size={16} /> Assign Roles to Employees
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionSettings;
