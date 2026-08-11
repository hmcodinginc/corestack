import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { 
  Building2, 
  User, 
  Palette, 
  Settings as GeneralIcon, 
  Shield, 
  Bell, 
  Receipt, 
  FileText, 
  CheckSquare, 
  Key, 
  Database,
  LogOut
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

const SETTINGS_NAV = [
  { path: '/settings/firm', label: 'Firm Profile', icon: Building2 },
  { path: '/settings/profile', label: 'My Profile', icon: User },
  { path: '/settings/appearance', label: 'Appearance', icon: Palette },
  { path: '/settings/general', label: 'General', icon: GeneralIcon },
  { path: '/settings/security', label: 'Security', icon: Shield },
  { path: '/settings/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings/billing', label: 'Billing', icon: Receipt },
  { path: '/settings/documents', label: 'Documents', icon: FileText },
  { path: '/settings/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/settings/permissions', label: 'Permissions', icon: Key },
  { path: '/settings/data', label: 'Data Management', icon: Database },
];

export const SettingsLayout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const currentNav = SETTINGS_NAV.find(n => location.pathname.startsWith(n.path)) || SETTINGS_NAV[0];

  return (
    <PageContainer>
      <PageHeader
        title="Settings & Configuration"
        description="Manage your firm, user preferences, and system parameters."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Settings', path: '/settings' }, { label: currentNav.label }]}
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
          <nav className="flex flex-col p-2 space-y-1">
            {SETTINGS_NAV.map((nav) => {
              const Icon = nav.icon;
              return (
                <NavLink
                  key={nav.path}
                  to={nav.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon size={18} />
                  {nav.label}
                </NavLink>
              );
            })}
            
            <div className="pt-4 mt-2 border-t border-gray-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-danger hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsLayout;
