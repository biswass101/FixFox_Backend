import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';
import { User } from '@/types/auth';

const mockUser: User = {
  id: 'u-123',
  email: 'admin@acme.com',
  fullName: 'Admin User',
  role: 'ADMIN',
  phone: '01700000000',
  skills: [],
  organization: {
    id: 'org-123',
    name: 'Acme Corp',
    slug: 'acme-corp',
    defaultCurrency: 'BDT',
  },
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('starts with unauthenticated initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets user and updates isAuthenticated state', () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('clears user authentication state on clearAuth', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('sets loading state correctly', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

