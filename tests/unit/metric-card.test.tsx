import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ClipboardList } from 'lucide-react';

describe('MetricCard', () => {
  it('renders title, value, and description', () => {
    render(
      <MetricCard
        title="Total Orders"
        value={42}
        icon={ClipboardList}
        description="All recorded orders"
      />
    );

    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('All recorded orders')).toBeInTheDocument();
  });

  it('renders skeleton when loading', () => {
    const { container } = render(
      <MetricCard
        title="Total Orders"
        value={42}
        icon={ClipboardList}
        isLoading={true}
      />
    );

    expect(screen.queryByText('42')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

