import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invitationsApi } from '@/lib/api/invitations.api';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('invitationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /invitations', async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: [{ id: 'inv-1', email: 'tech@fixflow.app' }] },
    });

    const result = await invitationsApi.list();
    expect(apiClient.get).toHaveBeenCalledWith('/invitations');
    expect(result).toHaveLength(1);
  });

  it('calls POST /invitations to create an invite', async () => {
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { id: 'inv-2', email: 'new@fixflow.app' } },
    });

    const result = await invitationsApi.create({ email: 'new@fixflow.app', role: 'TECHNICIAN' });
    expect(apiClient.post).toHaveBeenCalledWith('/invitations', { email: 'new@fixflow.app', role: 'TECHNICIAN' });
    expect(result.id).toBe('inv-2');
  });

  it('calls POST /invitations/:id/revoke to revoke', async () => {
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true },
    });

    await invitationsApi.revoke('inv-1');
    expect(apiClient.post).toHaveBeenCalledWith('/invitations/inv-1/revoke');
  });

  it('calls GET /invitations/verify/:token', async () => {
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true, data: { organizationName: 'FixFlow HQ', email: 'user@fixflow.app' } },
    });

    const result = await invitationsApi.verify('raw-token-123');
    expect(apiClient.get).toHaveBeenCalledWith('/invitations/verify/raw-token-123');
    expect(result.organizationName).toBe('FixFlow HQ');
  });

  it('calls POST /invitations/accept', async () => {
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          accessToken: 'token-abc',
          user: { id: 'u1', email: 'user@fixflow.app', role: 'TECHNICIAN' },
        },
      },
    });

    const result = await invitationsApi.accept({
      token: 'raw-token-123',
      fullName: 'John Doe',
      password: 'password123',
    });
    expect(apiClient.post).toHaveBeenCalledWith('/invitations/accept', {
      token: 'raw-token-123',
      fullName: 'John Doe',
      password: 'password123',
    });
    expect(result.accessToken).toBe('token-abc');
  });
});
