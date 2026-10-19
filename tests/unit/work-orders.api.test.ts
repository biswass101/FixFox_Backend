import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workOrdersApi } from '@/lib/api/work-orders.api';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('workOrdersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /work-orders with creation payload', async () => {
    const mockOrder = { id: 'wo-1', title: 'Leaking pipe', status: 'OPEN' };
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: mockOrder },
    });

    const result = await workOrdersApi.create({
      title: 'Leaking pipe',
      description: 'Major leak in basement',
      locationId: 'loc-1',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/work-orders', {
      title: 'Leaking pipe',
      description: 'Major leak in basement',
      locationId: 'loc-1',
    });
    expect(result.id).toBe('wo-1');
  });

  it('calls POST /work-orders/:id/status to advance workflow', async () => {
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 'wo-1', status: 'IN_PROGRESS' } },
    });

    const result = await workOrdersApi.updateStatus('wo-1', {
      status: 'IN_PROGRESS',
      version: 1,
    });

    expect(apiClient.post).toHaveBeenCalledWith('/work-orders/wo-1/status', {
      status: 'IN_PROGRESS',
      version: 1,
    });
    expect(result.status).toBe('IN_PROGRESS');
  });

  it('calls POST /work-orders/:id/resolve with resolution summary', async () => {
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 'wo-1', status: 'RESOLVED' } },
    });

    const result = await workOrdersApi.resolve('wo-1', {
      resolutionSummary: 'Pipe replaced and sealed with waterproof tape',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/work-orders/wo-1/resolve', {
      resolutionSummary: 'Pipe replaced and sealed with waterproof tape',
    });
    expect(result.status).toBe('RESOLVED');
  });

  it('calls POST /work-orders/:id/ai-analysis/review to record manager triage decision', async () => {
    const mockAnalysis = { id: 'ai-1', status: 'REVIEWED', accepted: true };
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: mockAnalysis },
    });

    const result = await workOrdersApi.reviewAITriage('wo-1', {
      accepted: true,
    });

    expect(apiClient.post).toHaveBeenCalledWith('/work-orders/wo-1/ai-analysis/review', {
      accepted: true,
    });
    expect(result.status).toBe('REVIEWED');
  });
});

