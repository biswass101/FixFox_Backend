import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import { TechnicianSummary } from '@/types/entities';

export const techniciansApi = {
  async list(): Promise<TechnicianSummary[]> {
    const response = await apiClient.get<ApiResponse<TechnicianSummary[]>>('/technicians');
    return response.data.data;
  },
};

