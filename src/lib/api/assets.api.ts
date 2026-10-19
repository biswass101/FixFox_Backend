import apiClient from '@/lib/axios';
import { PaginatedResponse, ApiResponse } from '@/types/api';
import { Asset, AssetCondition } from '@/types/entities';

export interface AssetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
  category?: string;
  isActive?: boolean;
}

export interface CreateAssetInput {
  locationId: string;
  assetCode: string;
  name: string;
  category: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiresAt?: string;
  condition?: AssetCondition;
  isActive?: boolean;
}

export interface UpdateAssetInput {
  locationId?: string;
  assetCode?: string;
  name?: string;
  category?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiresAt?: string;
  condition?: AssetCondition;
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

  async create(input: CreateAssetInput): Promise<Asset> {
    const response = await apiClient.post<ApiResponse<Asset>>('/assets', input);
    return response.data.data;
  },

  async update(id: string, input: UpdateAssetInput): Promise<Asset> {
    const response = await apiClient.patch<ApiResponse<Asset>>(`/assets/${id}`, input);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/assets/${id}`);
  },
};
