import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Download, FileSpreadsheet, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { invoiceService } from '@/services/BillingService';
import { employeeService } from '@/services/EmployeeService';
import { downloadDummyFile } from '@/utils/downloadUtils';
import { clientService } from '@/services/ClientService';
import { taskService } from '@/services/TaskService';
import { documentService } from '@/services/DocumentService';
import { format } from 'date-fns';

export const CustomReports: React.FC = () => {
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState('This Month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    let rawData: any[] = [];
    
    try {
      if (reportType === 'financial') {
        const res = await invoiceService.getAll();
        rawData = res.map(r => ({
          id: r.invoiceNumber,
          date: r.billingDate,
          details: 'Invoice',
          metric: `₹${r.totalAmount.toLocaleString()}`,
          status: r.status
        }));
      } else if (reportType === 'task') {
        const res = await taskService.getAll();
        rawData = res.map(r => ({
          id: r.taskCode,
          date: r.dueDate,
          details: r.taskName,
          metric: r.priority,
          status: r.status
        }));
      } else if (reportType === 'client') {
        const res = await clientService.getAll();
        rawData = res.map(r => ({
          id: r.clientCode || 'CLI',
          date: r.createdAt || new Date().toISOString().split('T')[0],
          details: r.clientName,
          metric: r.clientType || '-',
          status: r.status
        }));
      } else if (reportType === 'employee') {
        const res = await employeeService.getAll();
        rawData = res.map(r => ({
          id: r.employeeId || 'EMP',
          date: r.joiningDate || r.createdAt || new Date().toISOString().split('T')[0],
          details: `${r.firstName} ${r.lastName}`,
          metric: r.employmentType || '-',
          status: r.status
        }));
      } else if (reportType === 'document') {
        const res = await documentService.getAll();
        rawData = res.map(r => ({
          id: r.documentNumber || 'DOC',
          date: r.createdAt || new Date().toISOString().split('T')[0],
          details: r.documentName,
          metric: r.category || '-',
          status: r.status
        }));
      }
      
      setTableData(rawData);
      setIsGenerated(true);
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: string) => {
    if (type === 'CSV') {
      // Basic CSV export demo
      const headers = ['ID', 'Date', 'Type', 'Amount', 'Status'];
      const rows = [
        ['INV-001', '2026-08-01', 'Invoice', '50000', 'Paid'],
        ['INV-002', '2026-08-05', 'Invoice', '75000', 'Pending']
      ];
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(',') + '\n' 
        + rows.map(e => e.join(',')).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${reportType}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exporting ${type} report...`);
    } else if (type === 'PDF') {
      downloadDummyFile(`${reportType}_report.pdf`, `Dummy PDF Content for ${reportType} report.`);
      toast.success('Export started');
    } else {
      toast.success(`Exporting ${type} report... (UI Ready)`);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Custom Report Builder"
        description="Generate, filter, and export detailed MIS reports."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Reports', path: '/reports' },
          { label: 'Builder' }
        ]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('CSV')}><FileSpreadsheet size={16} className="mr-2" /> Export CSV</Button>
            <Button onClick={() => handleExport('PDF')}><Download size={16} className="mr-2" /> Export PDF</Button>
          </div>
        }
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Report Type</label>
          <select 
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="financial">Financial Reports</option>
            <option value="employee">Employee Reports</option>
            <option value="client">Client Reports</option>
            <option value="task">Task Reports</option>
            <option value="document">Document Reports</option>
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Date Range</label>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
            <option value="This Year">This Year</option>
            <option value="Custom Range">Custom Range</option>
          </select>
        </div>

        {dateRange === 'Custom Range' && (
          <div className="flex gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Start Date</label>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">End Date</label>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
             </div>
          </div>
        )}

        <div className="flex items-end">
           <Button onClick={handleApply} disabled={loading} className="flex items-center gap-2">
              <Filter size={16} /> {loading ? 'Loading...' : 'Apply Filters'}
           </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {!isGenerated ? (
          <div className="p-16 text-center">
             <Search size={48} className="mx-auto text-gray-300 mb-4" />
             <h3 className="text-lg font-bold text-gray-900 mb-2">Report Preview</h3>
             <p className="text-sm text-gray-500 max-w-md mx-auto">
               Select your filters above and click Apply to generate the data table.
             </p>
          </div>
        ) : (
          <div className="p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 capitalize">{reportType} Report</h3>
                <span className="text-sm text-gray-500">Date Range: {dateRange}</span>
             </div>
             
             <table className="w-full text-left text-sm text-gray-600">
               <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                 <tr>
                   <th className="px-4 py-3 rounded-tl-lg">ID / Ref</th>
                   <th className="px-4 py-3">Date</th>
                   <th className="px-4 py-3">Details</th>
                   <th className="px-4 py-3">Amount / Metric</th>
                   <th className="px-4 py-3 rounded-tr-lg">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No data found for the selected filters.
                      </td>
                    </tr>
                 ) : (
                    tableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-4 font-mono font-medium text-gray-900">{row.id}</td>
                        <td className="px-4 py-4">{row.date ? format(new Date(row.date), 'MMM dd, yyyy') : '-'}</td>
                        <td className="px-4 py-4">{row.details}</td>
                        <td className="px-4 py-4 font-mono">{row.metric}</td>
                        <td className="px-4 py-4">
                           <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">
                             {row.status}
                           </span>
                        </td>
                      </tr>
                    ))
                 )}
               </tbody>
             </table>
             
             <div className="mt-4 pt-4 border-t border-gray-100 text-right text-xs text-gray-500">
                Showing {tableData.length} records
             </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default CustomReports;
