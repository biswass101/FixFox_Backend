import apiClient from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import {
  AnalyticsOverview,
  CategoryDistribution,
  PriorityDistribution,
  TrendDataPoint,
  TechnicianPerformance,
} from '@/types/analytics';

export const analyticsApi = {
  async getOverview(): Promise<AnalyticsOverview> {
    const response = await apiClient.get<ApiResponse<AnalyticsOverview>>('/analytics/overview');
    return response.data.data;
  },

  async getByCategory(): Promise<CategoryDistribution[]> {
    const response = await apiClient.get<ApiResponse<CategoryDistribution[]>>(
      '/analytics/by-category'
    );
    return response.data.data;
  },

  async getByPriority(): Promise<PriorityDistribution[]> {
    const response = await apiClient.get<ApiResponse<PriorityDistribution[]>>(
      '/analytics/by-priority'
    );
    return response.data.data;
  },

  async getTrends(): Promise<TrendDataPoint[]> {
    const response = await apiClient.get<ApiResponse<TrendDataPoint[]>>('/analytics/trends');
    return response.data.data;
  },

  async getTechnicianPerformance(): Promise<TechnicianPerformance[]> {
    const response = await apiClient.get<ApiResponse<TechnicianPerformance[]>>(
      '/analytics/technician-performance'
    );
    return response.data.data;
  },
};

