import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Activity, ShieldAlert, Users, Server, Clock, Search } from 'lucide-react';
import { activityLogService } from '@/services/ActivityLogService';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const AuditDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, today: 0, userActions: 0, systemActions: 0, securityEvents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activityLogService.getStatistics().then(s => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Audit Telemetry...</div>;

  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs & Activity"
        description="Centralized view of all system activities, changes, and security events."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Audit Trail' }]}
        action={
          <Button onClick={() => navigate('/audit/logs')} className="flex items-center gap-2">
            <Search size={16} /> Browse All Logs
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Activity size={18} className="text-primary" />
            <span className="text-sm font-semibold">Total Activities</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock size={18} className="text-blue-500" />
            <span className="text-sm font-semibold">Today</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">{stats.today}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Users size={18} className="text-purple-500" />
            <span className="text-sm font-semibold">User Actions</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">{stats.userActions}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Server size={18} className="text-gray-600" />
            <span className="text-sm font-semibold">System Actions</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">{stats.systemActions}</span>
        </div>

        <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-danger mb-2">
            <ShieldAlert size={18} />
            <span className="text-sm font-semibold">Security Events</span>
          </div>
          <span className="text-3xl font-bold text-danger">{stats.securityEvents}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-3xl mx-auto mt-12">
        <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Search size={28} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Search the Audit Trail</h3>
        <p className="text-gray-500 text-sm mb-6">
          Every action taken across all modules is securely logged here. You can filter by Date, User, Module, Action, or Severity to investigate changes.
        </p>
        <Button onClick={() => navigate('/audit/logs')} size="lg" className="px-8 shadow-md">
          Explore Activity Logs
        </Button>
      </div>
      
    </PageContainer>
  );
};

export default AuditDashboard;
