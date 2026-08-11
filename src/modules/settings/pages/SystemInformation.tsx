import React from 'react';
import { Info, HardDrive, LayoutTemplate, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const SystemInformation: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Info size={20} className="text-primary" /> System Information
        </h2>
        <p className="text-sm text-gray-500">Platform and environmental metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><LayoutTemplate size={16}/> Application Build</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Name</span>
              <span className="font-semibold text-gray-900">CoreStack Enterprise Planner</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Version</span>
              <span className="font-mono text-gray-900">v10.0.0-beta (Phase 10)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Environment</span>
              <span className="font-semibold text-gray-900 uppercase">Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">UI Architecture</span>
              <span className="font-semibold text-gray-900">React + Vite + Tailwind</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><HardDrive size={16}/> Storage Engine</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Database Driver</span>
              <span className="font-semibold text-primary">LocalStorage (Mock)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Security Mode</span>
              <span className="font-semibold text-amber-600">Client Side</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Storage Target</span>
              <span className="font-mono text-gray-900">Browser IndexedDB/Storage</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 md:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity size={16}/> Current Session</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Logged In User</p>
              <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Employee ID</p>
              <p className="font-mono text-gray-900">{user?.id}</p>
            </div>
            <div>
              <p className="font-semibold text-primary">{(user as any)?.roleName || 'None'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Device IP (Simulated)</p>
              <p className="font-mono text-gray-900">192.168.1.104</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemInformation;
