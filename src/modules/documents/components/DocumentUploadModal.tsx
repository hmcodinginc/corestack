import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Upload, File } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { documentSchema } from '@/schemas/document.schema';
import { documentService } from '@/services/DocumentService';
import { clientService } from '@/services/ClientService';
import { STATUS_OPTIONS } from '@/constants/status';

import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingDocId?: string; // If passed, it means we are replacing/updating a document
}

const CATEGORY_OPTIONS = [
  { label: 'PAN', value: 'PAN' },
  { label: 'Aadhaar', value: 'Aadhaar' },
  { label: 'GST Certificate', value: 'GST Certificate' },
  { label: 'TAN', value: 'TAN' },
  { label: 'CIN', value: 'CIN' },
  { label: 'Bank Statement', value: 'Bank Statement' },
  { label: 'Audit Report', value: 'Audit Report' },
  { label: 'Balance Sheet', value: 'Balance Sheet' },
  { label: 'IT Return', value: 'IT Return' },
  { label: 'GST Return', value: 'GST Return' },
  { label: 'Financial Statements', value: 'Financial Statements' },
  { label: 'Invoices', value: 'Invoices' },
  { label: 'Other', value: 'Other' },
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose, onSuccess, existingDocId }) => {
  const [clients, setClients] = useState<{label: string, value: string}[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [existingDoc, setExistingDoc] = useState<any>(null);
  
  const isEditMode = Boolean(existingDocId);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const methods = useForm<any>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentName: '',
      category: '',
      clientId: '',
      status: 'ACTIVE',
      description: '',
      expiryDate: '',
      fileSize: 0,
      fileType: 'application/pdf',
    }
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (isOpen) {
      clientService.getAll().then(all => {
        setClients(all.filter(c => c.status === 'ACTIVE').map(c => ({ label: `${c.clientName} (${c.clientCode})`, value: c.id })));
      });

      if (isEditMode && existingDocId) {
        documentService.getById(existingDocId).then(doc => {
          if (doc) {
            setExistingDoc(doc);
            reset({
              ...doc,
              description: doc.description || '',
              expiryDate: doc.expiryDate || '',
            });
          }
        });
      } else {
        setExistingDoc(null);
        reset({
          documentName: '',
          category: '',
          clientId: '',
          status: 'ACTIVE',
          description: '',
          expiryDate: '',
          fileSize: Math.floor(Math.random() * 5000000) + 100000, // Demo mock size
          fileType: 'application/pdf',
        });
      }
    }
  }, [isOpen, isEditMode, existingDocId, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    methods.setValue('fileSize', file.size, { shouldValidate: true });
    methods.setValue('fileType', file.type || 'application/octet-stream', { shouldValidate: true });
    
    // Auto-fill document name if empty
    if (!methods.getValues('documentName')) {
      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.') || file.name;
      methods.setValue('documentName', nameWithoutExt, { shouldValidate: true });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setExistingDoc(null);
    onClose();
  };

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      let fileUrl = '';
      if (selectedFile) {
        // Only read as Base64 if it's smaller than 2MB to prevent LocalStorage crashing
        if (selectedFile.size <= 2 * 1024 * 1024) {
           fileUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(selectedFile);
           });
        } else {
           toast('File is too large (>2MB) to save payload in demo mode. Saving metadata only.', { icon: '⚠️' });
        }
      }

      const payload = {
        ...data,
        uploadedBy: 'EMP-MOCK', // In real app, get from AuthContext
        departmentId: 'DEPT-MOCK', // In real app, get from AuthContext or derive from Client
        fileUrl: fileUrl || undefined,
      };

      if (isEditMode && existingDocId) {
        await documentService.update(existingDocId, payload, true); // true = increment version
        toast.success('Document updated successfully');
      } else {
        await documentService.create(payload);
        toast.success('Document uploaded successfully');
      }
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">{isEditMode ? 'Replace Document Version' : 'Upload New Document'}</h2>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <div 
            className={`mb-6 border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer group ${
              isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Upload size={24} />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
            <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG, DOCX up to 10MB</p>
            
            {!selectedFile && existingDoc && (
               <div className="mt-4 flex flex-col items-center">
                 <p className="text-xs text-gray-500 mb-1">Current File (v{existingDoc.version})</p>
                 <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                  <File size={14} /> {existingDoc.documentName}
                 </div>
               </div>
            )}

            {previewUrl ? (
              <div className="mt-4 flex flex-col items-center">
                <img src={previewUrl} alt="Preview" className="max-h-32 object-contain rounded border border-gray-200 shadow-sm" />
                <p className="text-xs text-gray-500 mt-2">{selectedFile?.name}</p>
              </div>
            ) : selectedFile ? (
              <div className="mt-4 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <File size={14} /> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            ) : null}
          </div>

          <FormProvider {...methods}>
            <form id="upload-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput name="documentName" label="Document Name" placeholder="e.g. FY24 Balance Sheet" />
                <FormSelect name="category" label="Category" options={CATEGORY_OPTIONS} />
                <div className="md:col-span-2">
                   <FormSelect name="clientId" label="Assign to Client" options={clients} />
                </div>
                <FormSelect name="status" label="Status" options={[...STATUS_OPTIONS, {label: 'Expired', value: 'EXPIRED'}]} />
                <FormInput name="expiryDate" label="Expiry Date (Optional)" type="date" />
                <div className="md:col-span-2">
                   <FormTextarea name="description" label="Description / Comments (Optional)" placeholder="Add any relevant notes about this document..." />
                </div>
              </div>
            </form>
          </FormProvider>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 z-10">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="upload-form" disabled={isSubmitting || !selectedFile && !isEditMode}>
            {isSubmitting ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>
    </div>
  );
};
