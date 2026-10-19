import apiClient from '@/lib/axios';
import { PaginatedResponse, ApiResponse } from '@/types/api';
import { Notification } from '@/types/entities';

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const notificationsApi = {
  async list(params?: NotificationQueryParams): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<PaginatedResponse<Notification>>('/notifications', {
      params,
    });
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data.count;
  },

  async markRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<ApiResponse<Notification>>(
      `/notifications/${id}/read`
    );
    return response.data.data;
  },

  async markAllRead(): Promise<void> {
    await apiClient.post('/notifications/mark-all-read');
  },
};

