import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { dataManagementService } from '@/services/DataManagementService';
import { seedRealisticDemoData } from '@/data/demoSeed';
import { toast } from 'react-hot-toast';
import { Database, Download, Upload, AlertTriangle, RefreshCw } from 'lucide-react';

export const DataManagement: React.FC = () => {
  const [stats, setStats] = useState<{ totalBytes: number; formattedSize: string; counts: Record<string, number> } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0); // to reset file input

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = () => {
    setStats(dataManagementService.getStorageStats());
  };

  const handleExport = async () => {
    const jsonStr = await dataManagementService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `corestack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported successfully');
    refreshStats();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (window.confirm('Warning: This will overwrite your existing data with the contents of the backup file. Are you sure you want to proceed?')) {
          const result = await dataManagementService.importData(content);
          if (result.success) {
            toast.success(result.message);
            refreshStats();
          } else {
            toast.error(result.message);
          }
        }
      } catch (err) {
        toast.error('Failed to read file');
      }
      setFileInputKey(prev => prev + 1); // Reset input
    };
    reader.readAsText(file);
  };

  const handleClearDemoData = async () => {
    if (resetConfirmText !== 'RESET') {
      toast.error('Please type RESET to confirm');
      return;
    }
    
    setIsResetting(true);
    try {
      await dataManagementService.clearDemoData();
      toast.success('All data has been cleared. The system is empty.');
      setResetConfirmText('');
      refreshStats();
      // The event listener in App.tsx (if added) will reload the app, otherwise prompt user to refresh.
      setTimeout(() => {
        window.location.href = '/dashboard'; // Hard redirect to dashboard to rebuild states
      }, 1000);
    } catch (e) {
      toast.error('Failed to clear data');
      setIsResetting(false);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedRealisticDemoData();
      toast.success('Realistic demo data generated successfully!');
      refreshStats();
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (e) {
      toast.error('Failed to generate demo data');
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Database size={20} className="text-primary" /> Data Management
        </h2>
        <p className="text-sm text-gray-500">Backup, restore, or wipe your system data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        
        {/* Left Column: Stats & Import/Export */}
        <div className="space-y-6">
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4">Storage Metrics</h3>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-600">Total Registered Size</span>
              <span className="text-lg font-mono font-bold text-primary">{stats?.formattedSize || '0 KB'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {stats && Object.entries(stats.counts).map(([key, count]) => (
                <div key={key} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-xs font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2"><Download size={16}/> Backup (Export)</h3>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Download a complete JSON snapshot of all registered CoreStack data. This file can be used to restore your exact system state on another machine.
            </p>
            <Button onClick={handleExport} className="w-full">Export Data to JSON</Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Upload size={16}/> Restore (Import)</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Upload a previously exported JSON backup. This will safely overwrite existing records in the registry.
            </p>
            <div className="relative">
              <input 
                key={fileInputKey}
                type="file" 
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="w-full pointer-events-none">Select JSON Backup File...</Button>
            </div>
          </div>

        </div>

        {/* Right Column: Danger Zone */}
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-blue-800 mb-2 flex items-center gap-2"><Database size={18}/> Demo Data Generation</h3>
            <p className="text-sm text-blue-700 mb-6 leading-relaxed">
              Generate a massive set of realistic demo data, including departments, roles, employees (Kalp, Rahul, Ajay), clients, tasks, and invoices. This will overwrite existing data.
            </p>
            <Button 
              onClick={handleSeedData} 
              disabled={isSeeding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} className={isSeeding ? 'animate-spin' : ''} />
              {isSeeding ? 'Generating Data...' : 'Generate Realistic Demo Data'}
            </Button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-danger mb-2 flex items-center gap-2"><AlertTriangle size={18}/> Danger Zone</h3>
            <p className="text-sm text-red-800 mb-6 leading-relaxed">
              Clearing demo data will immediately and permanently delete all records (Users, Tasks, Invoices, Documents) from the system. The application will be reset to a completely blank slate.
            </p>
            
            <div className="bg-white/60 p-4 rounded-lg border border-red-100">
              <label className="block text-xs font-bold text-danger uppercase tracking-wider mb-2">
                Type RESET to confirm
              </label>
              <input 
                type="text" 
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="RESET" 
                className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:ring-danger mb-4" 
              />
              <Button 
                onClick={handleClearDemoData} 
                disabled={resetConfirmText !== 'RESET' || isResetting}
                className="w-full bg-danger hover:bg-red-700 text-white flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} className={isResetting ? 'animate-spin' : ''} />
                {isResetting ? 'Wiping System...' : 'Wipe All CoreStack Data'}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataManagement;
