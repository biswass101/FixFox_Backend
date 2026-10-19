import { User } from './auth';
import { Location, Asset } from './entities';

export type WorkOrderStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export type WorkOrderPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type WorkOrderCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HVAC'
  | 'STRUCTURAL'
  | 'CLEANING'
  | 'SAFETY'
  | 'EQUIPMENT'
  | 'FURNITURE'
  | 'IT_NETWORK'
  | 'PEST_CONTROL'
  | 'LANDSCAPING'
  | 'ELEVATOR'
  | 'FIRE_SAFETY'
  | 'GENERAL'
  | 'OTHER';

export interface WorkOrderImage {
  id: string;
  secureUrl: string;
  cloudinaryPublicId: string;
  format?: string | null;
  byteSize: number;
  createdAt: string;
  uploadedBy?: {
    id: string;
    fullName: string;
    role: string;
  };
}

export interface WorkNote {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    role: string;
  };
}

export interface WorkOrderCost {
  id: string;
  type: 'PARTS' | 'LABOR';
  description: string;
  quantity: number | string;
  unitCost: number | string;
  totalCost: number | string;
  laborHours?: number | string | null;
  currency: string;
  createdAt: string;
}

export interface WorkOrderAIAnalysis {
  id: string;
  model: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVIEWED';
  suggestedCategory?: WorkOrderCategory | null;
  suggestedPriority?: WorkOrderPriority | null;
  summary?: string | null;
  safetyFlags?: string[] | null;
  rationale?: string | null;
  confidence?: number | null;
  accepted?: boolean | null;
  overrideReason?: string | null;
  finalCategory?: WorkOrderCategory | null;
  finalPriority?: WorkOrderPriority | null;
  processingStartedAt?: string | null;
  processingCompletedAt?: string | null;
}

export interface WorkOrderStatusHistory {
  id: string;
  previousStatus?: WorkOrderStatus | null;
  newStatus: WorkOrderStatus;
  reason?: string | null;
  createdAt: string;
  changedBy: {
    id: string;
    fullName: string;
    role: string;
  };
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  category: WorkOrderCategory;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  dueAt?: string | null;
  assignedAt?: string | null;
  startedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  resolutionSummary?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  location?: Location;
  asset?: Asset | null;
  reporter?: User;
  assignee?: User | null;
  images?: WorkOrderImage[];
  notes?: WorkNote[];
  costs?: WorkOrderCost[];
  aiAnalysis?: WorkOrderAIAnalysis | null;
  statusHistory?: WorkOrderStatusHistory[];
}

