import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WorkOrderFilters } from '@/components/work-orders/work-order-filters';

describe('WorkOrderFilters', () => {
  it('triggers onSearchChange when typing in the search input', () => {
    const onSearchChange = vi.fn();
    render(
      <WorkOrderFilters
        search=""
        onSearchChange={onSearchChange}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/search work orders/i);
    fireEvent.change(input, { target: { value: 'Elevator' } });

    expect(onSearchChange).toHaveBeenCalledWith('Elevator');
  });

  it('renders reset button when active filters exist and triggers onReset', () => {
    const onReset = vi.fn();
    render(
      <WorkOrderFilters
        search="Pipe"
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onReset={onReset}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset/i });
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(resetButton);
    expect(onReset).toHaveBeenCalled();
  });
});

