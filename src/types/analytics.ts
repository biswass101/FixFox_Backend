import { WorkOrderCategory, WorkOrderPriority } from './work-orders';

export interface AnalyticsOverview {
  totalWorkOrders: number;
  countsByStatus: {
    open: number;
    assigned: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  overdueCount: number;
  meanTimeToResolveHours: number;
  totalMaintenanceCost: number;
}

export interface CategoryDistribution {
  category: WorkOrderCategory;
  count: number;
}

export interface PriorityDistribution {
  priority: WorkOrderPriority;
  count: number;
}

export interface TrendDataPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface TechnicianPerformance {
  technicianId: string;
  name: string;
  email: string;
  assignedCount: number;
  resolvedCount: number;
  mttrHours: number;
}

