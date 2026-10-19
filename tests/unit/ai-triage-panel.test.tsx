import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AITriagePanel } from '@/components/work-orders/ai-triage-panel';
import { useAuthStore } from '@/stores/auth.store';
import { WorkOrderAIAnalysis } from '@/types/work-orders';

const mockMutateAsync = vi.fn();

vi.mock('@/hooks/use-work-orders', () => ({
  useReviewAITriageMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useRetryAITriageMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

const mockAnalysis: WorkOrderAIAnalysis = {
  id: 'ai-123',
  workOrderId: 'wo-123',
  organizationId: 'org-123',
  model: 'gpt-4o-mini',
  modelVersion: '1.0',
  suggestedCategory: 'PLUMBING',
  suggestedPriority: 'HIGH',
  summary: 'Water pipe leaking near electrical junction box',
  safetyFlags: ['Electrical shock hazard', 'Standing water near wiring'],
  rationale: 'Active water leak near active circuit breaker increases electrocution hazard.',
  confidence: 0.95,
  status: 'COMPLETED',
  createdAt: '2026-10-19T10:00:00Z',
  updatedAt: '2026-10-19T10:00:00Z',
};

describe('AITriagePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setUser({
      id: 'admin-1',
      email: 'admin@acme.com',
      fullName: 'Manager User',
      role: 'MANAGER',
      skills: [],
      organization: { id: 'org-1', name: 'Acme', slug: 'acme', defaultCurrency: 'BDT' },
    });
  });

  it('renders suggested category, priority, and summary', () => {
    render(<AITriagePanel workOrderId="wo-123" aiAnalysis={mockAnalysis} />);

    expect(screen.getByText('AI Triage Assessment')).toBeInTheDocument();
    expect(screen.getByText('PLUMBING')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Water pipe leaking near electrical junction box')).toBeInTheDocument();
  });

  it('renders safety hazard warnings when flags are present', () => {
    render(<AITriagePanel workOrderId="wo-123" aiAnalysis={mockAnalysis} />);

    expect(screen.getByText('Safety Flags Identified')).toBeInTheDocument();
    expect(screen.getByText('Electrical shock hazard')).toBeInTheDocument();
    expect(screen.getByText('Standing water near wiring')).toBeInTheDocument();
  });

  it('allows manager to accept suggestions with one click', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<AITriagePanel workOrderId="wo-123" aiAnalysis={mockAnalysis} />);

    const acceptButton = screen.getByRole('button', { name: /accept suggestions/i });
    fireEvent.click(acceptButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({ accepted: true });
  });
});

