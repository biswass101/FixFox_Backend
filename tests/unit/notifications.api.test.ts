import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationsApi } from '@/lib/api/notifications.api';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('notificationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /notifications/unread-count', async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { count: 3 } },
    });

    const count = await notificationsApi.getUnreadCount();
    expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(count).toBe(3);
  });

  it('calls PATCH /notifications/:id/read', async () => {
    (apiClient.patch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 'notif-1', readAt: '2026-10-19T12:00:00Z' } },
    });

    const result = await notificationsApi.markRead('notif-1');
    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/notif-1/read');
    expect(result.readAt).toBeDefined();
  });

  it('calls POST /notifications/mark-all-read', async () => {
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true },
    });

    await notificationsApi.markAllRead();
    expect(apiClient.post).toHaveBeenCalledWith('/notifications/mark-all-read');
  });
});

