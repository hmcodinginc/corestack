import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Users, Building2, Briefcase, FileText, IndianRupee, TrendingUp, AlertCircle, CheckSquare, Download, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadDummyFile } from '@/utils/downloadUtils';

import { analyticsService, DashboardMetrics } from '@/services/AnalyticsService';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/layout/StatsCard';
import { Button } from '@/components/ui/Button';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const ReportsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [taskData, setTaskData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsService.getDashboardMetrics(),
      analyticsService.getRevenueTrendData(),
      analyticsService.getTaskStatusDistribution()
    ]).then(([m, r, t]) => {
      setMetrics(m);
      setRevenueData(r);
      setTaskData(t);
      setLoading(false);
    });
  }, []);

  if (loading || !metrics) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Executive Dashboard"
        description="Real-time MIS and analytics across all firm modules."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Reports & Analytics' }]}
        action={
          <div className="flex gap-3">
             <Button variant="outline" onClick={() => navigate('/reports/custom')}>Custom Reports</Button>
             <Button 
               className="flex items-center gap-2"
               onClick={() => {
                 downloadDummyFile('reports_dashboard.pdf', 'Dummy PDF Content for Reports Dashboard');
                 toast.success('Export started');
               }}
             >
               <Download size={16} /> Export PDF
             </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard title="Total Revenue" value={`₹${metrics.totalRevenue.toLocaleString()}`} icon={TrendingUp} colorVariant="success" />
        <StatsCard title="Outstanding" value={`₹${metrics.outstandingPayments.toLocaleString()}`} icon={AlertCircle} colorVariant="danger" />
        <StatsCard title="Active Clients" value={metrics.activeClients} icon={Building2} colorVariant="primary" />
        <StatsCard title="Completed Tasks" value={metrics.completedTasks} icon={CheckSquare} colorVariant="info" />
        <StatsCard title="Total Documents" value={metrics.totalDocuments} icon={FileText} colorVariant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-6">Revenue Trend (Last 6 Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                <Bar dataKey="Revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-6">Task Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
             <div className="bg-red-50 p-3 rounded-lg border border-red-100">
               <p className="text-xs text-red-600 font-bold uppercase mb-1">Overdue</p>
               <p className="text-xl font-bold text-red-700">{metrics.overdueTasks}</p>
             </div>
             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
               <p className="text-xs text-blue-600 font-bold uppercase mb-1">Pending</p>
               <p className="text-xl font-bold text-blue-700">{metrics.pendingTasks}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-base font-bold text-gray-900 mb-4">Firm Overview</h3>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg"><Building2 size={20} /></div>
                    <div><p className="font-bold text-gray-900">Total Client Base</p><p className="text-xs text-gray-500">Across all categories</p></div>
                 </div>
                 <span className="text-xl font-black text-gray-900">{metrics.totalClients}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-lg"><Briefcase size={20} /></div>
                    <div><p className="font-bold text-gray-900">Total Workforce</p><p className="text-xs text-gray-500">Employees & Managers</p></div>
                 </div>
                 <span className="text-xl font-black text-gray-900">{metrics.totalEmployees}</span>
              </div>
           </div>
         </div>
      </div>
    </PageContainer>
  );
};

export default ReportsDashboard;
