import { describe, it, expect, vi, beforeEach } from 'vitest';
import { locationsApi } from '@/lib/api/locations.api';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('locationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /locations and returns paginated locations', async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 'loc-1', name: 'Server Room', isActive: true }],
        meta: { pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } },
      },
    });

    const result = await locationsApi.list();
    expect(apiClient.get).toHaveBeenCalledWith('/locations', { params: undefined });
    expect(result.data[0].name).toBe('Server Room');
  });

  it('calls POST /locations with new location input', async () => {
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 'loc-2', name: 'Main Lobby' } },
    });

    const result = await locationsApi.create({ name: 'Main Lobby', building: 'Building A' });
    expect(apiClient.post).toHaveBeenCalledWith('/locations', {
      name: 'Main Lobby',
      building: 'Building A',
    });
    expect(result.id).toBe('loc-2');
  });

  it('calls DELETE /locations/:id to remove a location', async () => {
    (apiClient.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true },
    });

    await locationsApi.delete('loc-2');
    expect(apiClient.delete).toHaveBeenCalledWith('/locations/loc-2');
  });
});

