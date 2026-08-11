import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Search, Filter, Download, FileText, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { activityLogService, AuditLog } from '@/services/ActivityLogService';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

export const AuditLogTable: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await activityLogService.getAll(true); // Include all logs
    const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setLogs(sorted);
    setFilteredLogs(sorted);
    setLoading(false);
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredLogs(logs);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = logs.filter(
      l => l.action.toLowerCase().includes(q) ||
           l.module.toLowerCase().includes(q) ||
           (l.userName || (l as any).performedBy || '').toLowerCase().includes(q) ||
           l.description.toLowerCase().includes(q) ||
           (l.entityName || (l as any).targetName || '').toLowerCase().includes(q)
    );
    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [searchQuery, logs]);

  const handleExport = (type: 'csv' | 'json') => {
    const dataStr = type === 'json' 
      ? JSON.stringify(filteredLogs, null, 2)
      : ['Timestamp,User,Role,Module,Action,Entity,Description,Severity'].concat(
          filteredLogs.map(l => `"${l.createdAt}","${l.userName}","${l.userRole}","${l.module}","${l.action}","${l.entityName}","${l.description}","${l.severity}"`)
        ).join('\n');
    
    const blob = new Blob([dataStr], { type: type === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${format(new Date(), 'yyyyMMdd_HHmmss')}.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Critical</span>;
      case 'Warning': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">Warning</span>;
      case 'Success': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Success</span>;
      default: return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Info</span>;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentData = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <PageContainer>
      <PageHeader
        title="Audit Trail"
        description="Comprehensive, immutable record of all system activities."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Audit Dashboard', path: '/audit' }, { label: 'Logs' }]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')} className="flex items-center gap-2">
              <Download size={16} /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')} className="flex items-center gap-2">
              <FileText size={16} /> Export JSON
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search users, modules, actions, descriptions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} /> Advanced Filters
          </Button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Timestamp</th>
                <th className="p-4 font-semibold text-gray-600">User</th>
                <th className="p-4 font-semibold text-gray-600">Module & Action</th>
                <th className="p-4 font-semibold text-gray-600">Entity</th>
                <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">Description</th>
                <th className="p-4 font-semibold text-gray-600">Severity</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 animate-pulse">Loading Audit Records...</td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8">
                    <EmptyState 
                      icon={<Search size={24} />} 
                      title="No logs found" 
                      description="No audit records match your current search criteria."
                    />
                  </td>
                </tr>
              ) : (
                currentData.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm:ss')}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{log.userName || (log as any).performedBy || 'System'}</div>
                      <div className="text-xs text-gray-500">{log.userRole || 'User'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{log.module}</div>
                      <div className="text-xs font-mono text-gray-500 bg-gray-100 px-1 py-0.5 rounded inline-block mt-1">
                        {log.action}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 max-w-[150px] truncate" title={log.entityName || (log as any).targetName}>{log.entityName || (log as any).targetName || 'N/A'}</div>
                      <div className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">{log.entityId || (log as any).targetId || 'N/A'}</div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-gray-600 text-xs max-w-xs truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="p-4">
                      {getSeverityBadge(log.severity || 'Info')}
                    </td>
                    <td className="p-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/audit/${log.id}`)}
                        className="text-primary hover:bg-primary/10"
                        title="View Full Details"
                      >
                        <Eye size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredLogs.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-medium text-gray-900">{filteredLogs.length}</span> records
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default AuditLogTable;
