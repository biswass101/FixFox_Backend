import apiClient from '@/lib/axios';
import { PaginatedResponse } from '@/types/api';
import {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderCategory,
} from '@/types/work-orders';

export interface WorkOrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: WorkOrderStatus;
  category?: WorkOrderCategory;
  priority?: WorkOrderPriority;
  assigneeId?: string;
  locationId?: string;
  assetId?: string;
  reporterId?: string;
  sortBy?: 'createdAt' | 'dueAt' | 'priority' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export const workOrdersApi = {
  async list(params?: WorkOrderQueryParams): Promise<PaginatedResponse<WorkOrder>> {
    const response = await apiClient.get<PaginatedResponse<WorkOrder>>('/work-orders', {
      params,
    });
    return response.data;
  },

  async getById(id: string): Promise<WorkOrder> {
    const response = await apiClient.get<{ success: boolean; data: WorkOrder }>(
      `/work-orders/${id}`
    );
    return response.data.data;
  },
};

