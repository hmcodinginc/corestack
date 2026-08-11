import { ArchiveEntity, StatusType } from './index';

export type ClientType = 'INDIVIDUAL' | 'BUSINESS' | 'COMPANY' | 'PARTNERSHIP' | 'LLP' | 'TRUST' | 'NGO' | 'OTHER';

export interface Client extends ArchiveEntity {
  // General Information
  clientCode: string;
  clientType: ClientType;
  clientName: string;
  companyName?: string;
  pan: string;
  gst?: string;
  tan?: string;
  cin?: string;
  aadhaar?: string;

  // Contact Information
  mobile: string;
  altMobile?: string;
  email?: string;
  website?: string;

  // Address
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;

  // Business Information
  industry?: string;
  businessCategory?: string;
  annualTurnover?: string;
  registrationDate?: string;

  // Assignment
  departmentId?: string;
  managerId?: string;
  employeeIds: string[];

  // Status & Additional
  status: StatusType | string;
  notes?: string;
  tags?: string[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  // Computed (For Grid Mapping)
  departmentName?: string;
  managerName?: string;
}

export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  individual: number;
  business: number;
  recentlyAdded: number;
}
