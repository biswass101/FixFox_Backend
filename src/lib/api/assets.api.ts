import apiClient from '@/lib/axios';
import { PaginatedResponse, ApiResponse } from '@/types/api';
import { Asset } from '@/types/entities';

export interface AssetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
  category?: string;
  isActive?: boolean;
}

export const assetsApi = {
  async list(params?: AssetQueryParams): Promise<PaginatedResponse<Asset>> {
    const response = await apiClient.get<PaginatedResponse<Asset>>('/assets', { params });
    return response.data;
  },

  async getById(id: string): Promise<Asset> {
    const response = await apiClient.get<ApiResponse<Asset>>(`/assets/${id}`);
    return response.data.data;
  },
};

