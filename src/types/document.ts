import { ArchiveEntity, StatusType } from './index';

export type DocumentCategory = 
  | 'PAN' | 'Aadhaar' | 'GST Certificate' | 'TAN' | 'CIN' 
  | 'Bank Statement' | 'Audit Report' | 'Balance Sheet' 
  | 'IT Return' | 'GST Return' | 'Financial Statements' 
  | 'Invoices' | 'Other' | string;

export interface AppDocument extends ArchiveEntity {
  documentNumber: string; // Auto-generated e.g. DOC-001
  documentName: string;
  category: DocumentCategory;
  clientId: string;
  departmentId?: string;
  uploadedBy: string; // Employee ID
  
  expiryDate?: string;
  description?: string;
  tags: string[];
  
  // File Metadata
  version: number;
  fileSize: number; // in bytes
  fileType: string; // MIME type
  fileUrl?: string; // Demo S3/Storage reference string
  
  status: StatusType | 'PENDING' | 'EXPIRED' | string;

  // Computed Fields for Grid
  clientName?: string;
  departmentName?: string;
  uploaderName?: string;
}

export interface DocumentStats {
  total: number;
  uploadedToday: number;
  pending: number;
  archived: number;
  missing: number; // Mock stat for now
  byCategory: Record<string, number>;
}
