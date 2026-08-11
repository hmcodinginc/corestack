export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArchiveEntity extends BaseEntity {
  isArchived: boolean;
  archivedAt?: string | null;
}

export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING';
export type StatusType = Status | 'ARCHIVED';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export interface Filters {
  [key: string]: string | number | boolean | null;
}

export interface PageResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface AuditInfo {
  createdBy?: string;
  updatedBy?: string;
  archivedBy?: string;
}

// Re-export auth types so we don't break existing code
export * from './auth';
export * from './role';
export * from './department';
export * from './designation';
export * from './employee';
export * from './client';
export * from './document';
export * from './task';
export * from './billing';
export * from './notification';
export * from './settings';
export * from './assignment';
