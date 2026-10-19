import apiClient from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderCategory,
  WorkNote,
  WorkOrderCost,
  WorkOrderImage,
  WorkOrderAIAnalysis,
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

export interface CreateWorkOrderInput {
  title: string;
  description: string;
  locationId: string;
  assetId?: string | null;
  category?: WorkOrderCategory;
  priority?: WorkOrderPriority;
}

export interface UpdateWorkOrderInput {
  title?: string;
  description?: string;
  locationId?: string;
  assetId?: string | null;
  category?: WorkOrderCategory;
  priority?: WorkOrderPriority;
  version: number;
}

export interface AssignTechnicianInput {
  technicianId: string;
  reason?: string;
}

export interface UpdateStatusInput {
  status: WorkOrderStatus;
  reason?: string;
  version?: number;
}

export interface ResolveWorkOrderInput {
  resolutionSummary: string;
}

export interface ReopenWorkOrderInput {
  reason: string;
}

export interface CreateNoteInput {
  body: string;
  isInternal?: boolean;
}

export interface CreateCostInput {
  type: 'PARTS' | 'LABOR';
  description: string;
  quantity: number;
  unitCost: number;
  laborHours?: number;
  currency?: string;
}

export interface ReviewAITriageInput {
  accepted: boolean;
  overrideReason?: string;
  finalCategory?: WorkOrderCategory;
  finalPriority?: WorkOrderPriority;
}

export const workOrdersApi = {
  async list(params?: WorkOrderQueryParams): Promise<PaginatedResponse<WorkOrder>> {
    const response = await apiClient.get<PaginatedResponse<WorkOrder>>('/work-orders', { params });
    return response.data;
  },

  async getById(id: string): Promise<WorkOrder> {
    const response = await apiClient.get<ApiResponse<WorkOrder>>(`/work-orders/${id}`);
    return response.data.data;
  },

  async create(input: CreateWorkOrderInput): Promise<WorkOrder> {
    const response = await apiClient.post<ApiResponse<WorkOrder>>('/work-orders', input);
    return response.data.data;
  },

  async update(id: string, input: UpdateWorkOrderInput): Promise<WorkOrder> {
    const response = await apiClient.patch<ApiResponse<WorkOrder>>(`/work-orders/${id}`, input);
    return response.data.data;
  },

  async assign(id: string, input: AssignTechnicianInput): Promise<WorkOrder> {
    const response = await apiClient.post<ApiResponse<WorkOrder>>(`/work-orders/${id}/assign`, input);
    return response.data.data;
  },

  async updateStatus(id: string, input: UpdateStatusInput): Promise<WorkOrder> {
    const response = await apiClient.post<ApiResponse<WorkOrder>>(`/work-orders/${id}/status`, input);
    return response.data.data;
  },

  async resolve(id: string, input: ResolveWorkOrderInput): Promise<WorkOrder> {
    const response = await apiClient.post<ApiResponse<WorkOrder>>(`/work-orders/${id}/resolve`, input);
    return response.data.data;
  },

  async reopen(id: string, input: ReopenWorkOrderInput): Promise<WorkOrder> {
    const response = await apiClient.post<ApiResponse<WorkOrder>>(`/work-orders/${id}/reopen`, input);
    return response.data.data;
  },

  async close(id: string): Promise<WorkOrder> {
    const response = await apiClient.post<ApiResponse<WorkOrder>>(`/work-orders/${id}/close`);
    return response.data.data;
  },

  async cancel(id: string, reason?: string): Promise<WorkOrder> {
    const response = await apiClient.post<ApiResponse<WorkOrder>>(`/work-orders/${id}/cancel`, {
      reason,
    });
    return response.data.data;
  },

  async createNote(id: string, input: CreateNoteInput): Promise<WorkNote> {
    const response = await apiClient.post<ApiResponse<WorkNote>>(
      `/work-orders/${id}/notes`,
      input
    );
    return response.data.data;
  },

  async createCost(id: string, input: CreateCostInput): Promise<WorkOrderCost> {
    const response = await apiClient.post<ApiResponse<WorkOrderCost>>(
      `/work-orders/${id}/costs`,
      input
    );
    return response.data.data;
  },

  async deleteCost(id: string, costId: string): Promise<void> {
    await apiClient.delete(`/work-orders/${id}/costs/${costId}`);
  },

  async uploadImage(id: string, file: File): Promise<WorkOrderImage> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<ApiResponse<WorkOrderImage>>(
      `/work-orders/${id}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async reviewAITriage(id: string, input: ReviewAITriageInput): Promise<WorkOrderAIAnalysis> {
    const response = await apiClient.post<ApiResponse<WorkOrderAIAnalysis>>(
      `/work-orders/${id}/ai-analysis/review`,
      input
    );
    return response.data.data;
  },

  async retryAITriage(id: string): Promise<WorkOrderAIAnalysis> {
    const response = await apiClient.post<ApiResponse<WorkOrderAIAnalysis>>(
      `/work-orders/${id}/ai-analysis/retry`
    );
    return response.data.data;
  },
};
