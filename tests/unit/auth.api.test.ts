import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '@/lib/api/auth.api';
import apiClient from '@/lib/axios';

vi.mock('@/lib/axios', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls /auth/login with credentials and returns auth response', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          user: { id: 'u1', email: 'test@example.com', fullName: 'Tester', role: 'ADMIN' },
          accessToken: 'token-123',
        },
      },
    };
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    const result = await authApi.login({ email: 'test@example.com', password: 'password123' });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.user.email).toBe('test@example.com');
  });

  it('calls /auth/register with user and organization payload', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          user: { id: 'u2', email: 'admin@acme.com', fullName: 'Admin', role: 'ADMIN' },
          accessToken: 'token-456',
        },
      },
    };
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    const result = await authApi.register({
      organizationName: 'Acme Corp',
      fullName: 'Admin',
      email: 'admin@acme.com',
      password: 'password123',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      organizationName: 'Acme Corp',
      fullName: 'Admin',
      email: 'admin@acme.com',
      password: 'password123',
    });
    expect(result.user.role).toBe('ADMIN');
  });

  it('calls /auth/me to fetch current user session', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: { id: 'u1', email: 'test@example.com', fullName: 'Tester', role: 'MANAGER' },
      },
    };
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    const user = await authApi.getMe();

    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(user.role).toBe('MANAGER');
  });

  it('calls /auth/logout to invalidate server session', async () => {
    (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { success: true },
    });

    await authApi.logout();

    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
  });
});

