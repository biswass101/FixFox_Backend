import apiClient from '@/lib/axios';
import { PaginatedResponse, ApiResponse } from '@/types/api';
import { Location } from '@/types/entities';

export interface LocationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export const locationsApi = {
  async list(params?: LocationQueryParams): Promise<PaginatedResponse<Location>> {
    const response = await apiClient.get<PaginatedResponse<Location>>('/locations', { params });
    return response.data;
  },

  async getById(id: string): Promise<Location> {
    const response = await apiClient.get<ApiResponse<Location>>(`/locations/${id}`);
    return response.data.data;
  },
};

