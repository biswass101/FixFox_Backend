import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/stores/auth.store';
import { User } from '@/types/auth';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/hooks/use-auth', () => ({
  useLogoutMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('renders common navigation links for any user', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Work Orders')).toBeInTheDocument();
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
  });

  it('renders technician specific links when role is TECHNICIAN', () => {
    const techUser: User = {
      id: 'tech-1',
      email: 'tech@example.com',
      fullName: 'Technician One',
      role: 'TECHNICIAN',
      skills: [],
      organization: { id: 'org-1', name: 'Acme', slug: 'acme', defaultCurrency: 'BDT' },
    };
    useAuthStore.getState().setUser(techUser);

    render(<Sidebar />);
    expect(screen.getByText('My Work Orders')).toBeInTheDocument();
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
  });

  it('renders admin links when role is ADMIN', () => {
    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@example.com',
      fullName: 'Admin User',
      role: 'ADMIN',
      skills: [],
      organization: { id: 'org-1', name: 'Acme', slug: 'acme', defaultCurrency: 'BDT' },
    };
    useAuthStore.getState().setUser(adminUser);

    render(<Sidebar />);
    expect(screen.getByText('Technicians')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.queryByText('My Work Orders')).not.toBeInTheDocument();
  });
});

