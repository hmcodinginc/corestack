import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useParams, useNavigate } from 'react-router-dom';
import { activityLogService, AuditLog } from '@/services/ActivityLogService';
import { ArrowLeft, Clock, User, Shield, Hash, Server, MapPin, Laptop, Info } from 'lucide-react';
import { format } from 'date-fns';

export const ActivityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      activityLogService.getById(id).then(data => {
        setLog(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Audit Record...</div>;
  }

  if (!log) {
    return (
      <PageContainer>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Not Found</h2>
          <p className="text-gray-500 mb-6">The audit log you are looking for does not exist or has been permanently deleted.</p>
          <Button onClick={() => navigate('/audit/logs')}>Return to Audit Trail</Button>
        </div>
      </PageContainer>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'Warning': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Success': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-blue-700 bg-blue-100 border-blue-200';
    }
  };

  const renderJsonBlock = (data: any, title: string) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-100 font-semibold text-gray-700 text-sm">
        {title}
      </div>
      <div className="p-4 overflow-auto flex-1 custom-scrollbar">
        {data && Object.keys(data).length > 0 ? (
          <pre className="text-xs font-mono text-gray-800 leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <span className="text-gray-400 text-sm italic">No data</span>
        )}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Activity Details"
        description="Immutable record of system event."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' }, 
          { label: 'Audit Dashboard', path: '/audit' }, 
          { label: 'Logs', path: '/audit/logs' },
          { label: log.id.substring(0, 8) }
        ]}
        action={
          <Button variant="outline" onClick={() => navigate('/audit/logs')} className="flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Logs
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <Info size={16} className="text-primary"/> Event Information
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-gray-500 text-xs mb-1">Event ID</span>
                <span className="font-mono text-gray-900 flex items-center gap-2">
                  <Hash size={14} className="text-gray-400"/> {log.id}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Timestamp</span>
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock size={14} className="text-gray-400"/> 
                  {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm:ss')}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Severity</span>
                <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full border ${getSeverityColor(log.severity || 'Info')}`}>
                  {log.severity || 'Info'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Action</span>
                <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {log.module} / {log.action}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <User size={16} className="text-primary"/> Actor Information
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-gray-500 text-xs mb-1">User</span>
                <span className="font-medium text-gray-900">{log.userName || (log as any).performedBy || 'System'}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Role Authority</span>
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <Shield size={14} className="text-gray-400"/> {log.userRole || 'User'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">User ID</span>
                <span className="font-mono text-gray-600">{log.userId || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <Server size={16} className="text-primary"/> Client Environment
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-gray-500 text-xs mb-1">IP Address</span>
                <span className="font-mono text-gray-900 flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400"/> {log.ipAddress || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1">Device / Browser</span>
                <span className="text-gray-900 flex items-center gap-2 leading-tight">
                  <Laptop size={14} className="text-gray-400 shrink-0"/> {log.device || 'Unknown Device'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Context & Diff */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {log.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <div>
                <span className="block text-gray-500 text-xs mb-1 uppercase tracking-wider font-bold">Target Entity</span>
                <span className="font-medium text-blue-900">{log.entityName || (log as any).targetName || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs mb-1 uppercase tracking-wider font-bold">Entity Type / ID</span>
                <span className="font-mono text-blue-800">{log.entityType || 'Unknown'} <span className="text-blue-400 px-2">|</span> {log.entityId || (log as any).targetId || 'N/A'}</span>
              </div>
            </div>
          </div>

          {(log.previousValue || log.newValue) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">State Changes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[300px]">
                {renderJsonBlock(log.previousValue, 'Previous State')}
                {renderJsonBlock(log.newValue, 'New State')}
              </div>
            </div>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Metadata</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto">
                 <pre className="text-xs font-mono text-gray-800">
                   {JSON.stringify(log.metadata, null, 2)}
                 </pre>
              </div>
            </div>
          )}

        </div>

      </div>
    </PageContainer>
  );
};

export default ActivityDetails;
