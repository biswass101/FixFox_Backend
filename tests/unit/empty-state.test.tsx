import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '@/components/shared/empty-state';
import { Wrench } from 'lucide-react';

describe('EmptyState component', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={Wrench}
        title="No work orders"
        description="No tickets found matching your filter criteria"
      />
    );

    expect(screen.getByText('No work orders')).toBeInTheDocument();
    expect(screen.getByText('No tickets found matching your filter criteria')).toBeInTheDocument();
  });

  it('renders and responds to action button click', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={Wrench}
        title="No work orders"
        description="Get started by submitting a new ticket"
        action={{ label: 'Create Order', onClick: handleAction }}
      />
    );

    const button = screen.getByRole('button', { name: 'Create Order' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});

