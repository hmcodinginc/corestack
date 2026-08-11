import React, { useEffect, useState } from 'react';
import { X, FileText, User, Calendar, Tag, Shield, Building2, Download } from 'lucide-react';
import { format } from 'date-fns';

import { AppDocument } from '@/types/document';
import { documentService } from '@/services/DocumentService';
import { clientService } from '@/services/ClientService';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ isOpen, onClose, documentId }) => {
  const [doc, setDoc] = useState<AppDocument | null>(null);
  const [clientName, setClientName] = useState<string>('Loading...');

  useEffect(() => {
    if (isOpen && documentId) {
      documentService.getById(documentId).then(d => {
        if (d) {
          setDoc(d);
          clientService.getById(d.clientId).then(c => {
             setClientName(c ? c.clientName : 'Unknown Client');
          });
        }
      });
    } else {
      setDoc(null);
    }
  }, [isOpen, documentId]);

  if (!isOpen || !doc) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = doc.fileType.startsWith('image/');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 lg:p-8 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
               <FileText size={20} />
             </div>
             <div>
               <h2 className="text-lg font-bold text-gray-900">{doc.documentName}</h2>
               <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-mono">{doc.documentNumber}</span>
                  <span>•</span>
                  <span>v{doc.version}.0</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              <Download size={16} /> Download
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded bg-gray-100 hover:bg-gray-200 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
           {/* Left Preview Pane */}
           <div className="flex-1 bg-gray-100/50 flex items-center justify-center p-6 border-r border-gray-200 overflow-y-auto">
              {doc.fileUrl ? (
                isImage ? (
                   <img src={doc.fileUrl} alt={doc.documentName} className="max-w-full max-h-full object-contain rounded shadow-sm border border-gray-200 bg-white" />
                ) : (
                   <iframe src={doc.fileUrl} title={doc.documentName} className="w-full h-full rounded shadow-sm bg-white" />
                )
              ) : (
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-md w-full">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800">Preview Not Available</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    This file was uploaded without payload data or is not a supported image format in this demo mode.
                  </p>
                </div>
              )}
           </div>

           {/* Right Metadata Pane */}
           <div className="w-full lg:w-96 bg-white overflow-y-auto p-6 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Document Details</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 flex items-center gap-2"><Building2 size={14} /> Assigned Client</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{clientName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 flex items-center gap-2"><Tag size={14} /> Category</dt>
                    <dd className="mt-1 text-sm text-gray-900">{doc.category}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 flex items-center gap-2"><Shield size={14} /> Status</dt>
                    <dd className="mt-1"><StatusBadge status={doc.isArchived ? 'ARCHIVED' : doc.status} /></dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">File Information</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Size</dt>
                    <dd className="mt-1 text-sm font-mono text-gray-900">{formatFileSize(doc.fileSize)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 truncate" title={doc.fileType}>{doc.fileType}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-gray-500 flex items-center gap-2"><Calendar size={14} /> Uploaded On</dt>
                    <dd className="mt-1 text-sm text-gray-900">{format(new Date(doc.createdAt), 'PPpp')}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-gray-500 flex items-center gap-2"><User size={14} /> Uploaded By</dt>
                    <dd className="mt-1 text-sm text-gray-900">{doc.uploadedBy}</dd>
                  </div>
                  {doc.expiryDate && (
                    <div className="col-span-2">
                      <dt className="text-xs font-medium text-gray-500 flex items-center gap-2 text-orange-600"><Calendar size={14} /> Expires On</dt>
                      <dd className="mt-1 text-sm font-semibold text-orange-600">{format(new Date(doc.expiryDate), 'PPP')}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {doc.description && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Description</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{doc.description}</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
