import { UserRole } from './auth';

export interface Location {
  id: string;
  name: string;
  building?: string | null;
  floor?: string | null;
  room?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'OUT_OF_SERVICE';

export interface Asset {
  id: string;
  locationId: string;
  assetCode: string;
  name: string;
  category: string;
  manufacturer?: string | null;
  modelNumber?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  warrantyExpiresAt?: string | null;
  condition: AssetCondition;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  location?: Location;
}

export interface TechnicianSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  skills: string[];
  activeJobCount: number;
}

export type NotificationType =
  | 'WORK_ORDER_ASSIGNED'
  | 'WORK_ORDER_STATUS_CHANGED'
  | 'WORK_ORDER_OVERDUE'
  | 'DEADLINE_APPROACHING'
  | 'AI_ANALYSIS_COMPLETED'
  | 'AI_ANALYSIS_FAILED'
  | 'RECURRING_FAULT_DETECTED'
  | 'INVITATION_RECEIVED';

export interface Notification {
  id: string;
  recipientId: string;
  workOrderId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  invitedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}
