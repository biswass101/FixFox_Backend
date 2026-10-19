import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assetsApi } from '@/lib/api/assets.api';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('assetsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /assets and returns equipment list', async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 'ast-1', assetCode: 'PUMP-01', name: 'Water Booster Pump', condition: 'GOOD' }],
      },
    });

    const result = await assetsApi.list();
    expect(apiClient.get).toHaveBeenCalledWith('/assets', { params: undefined });
    expect(result.data[0].assetCode).toBe('PUMP-01');
  });

  it('calls POST /assets with registration payload', async () => {
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 'ast-2', assetCode: 'GEN-01', name: 'Diesel Generator' } },
    });

    const result = await assetsApi.create({
      locationId: 'loc-1',
      assetCode: 'GEN-01',
      name: 'Diesel Generator',
      category: 'Power',
      condition: 'EXCELLENT',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/assets', {
      locationId: 'loc-1',
      assetCode: 'GEN-01',
      name: 'Diesel Generator',
      category: 'Power',
      condition: 'EXCELLENT',
    });
    expect(result.id).toBe('ast-2');
  });

  it('calls DELETE /assets/:id', async () => {
    (apiClient.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true },
    });

    await assetsApi.delete('ast-2');
    expect(apiClient.delete).toHaveBeenCalledWith('/assets/ast-2');
  });
});

