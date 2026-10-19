import apiClient from '@/lib/axios';
import { PaginatedResponse, ApiResponse } from '@/types/api';
import { Location } from '@/types/entities';

export interface LocationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateLocationInput {
  name: string;
  building?: string;
  floor?: string;
  room?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateLocationInput {
  name?: string;
  building?: string;
  floor?: string;
  room?: string;
  description?: string;
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

  async create(input: CreateLocationInput): Promise<Location> {
    const response = await apiClient.post<ApiResponse<Location>>('/locations', input);
    return response.data.data;
  },

  async update(id: string, input: UpdateLocationInput): Promise<Location> {
    const response = await apiClient.patch<ApiResponse<Location>>(`/locations/${id}`, input);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/locations/${id}`);
  },
};
