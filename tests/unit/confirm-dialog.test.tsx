import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

describe('ConfirmDialog component', () => {
  it('renders modal title and description when open', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete Location"
        description="Are you sure you want to delete this location?"
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Delete Location')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this location?')
    ).toBeInTheDocument();
  });

  it('triggers onConfirm when confirm button clicked', async () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete Location"
        description="Are you sure?"
        confirmLabel="Yes, Delete"
        variant="destructive"
        onConfirm={handleConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', { name: 'Yes, Delete' });
    fireEvent.click(confirmButton);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpenChange(false) when cancel button clicked', () => {
    const handleOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={handleOpenChange}
        title="Delete Location"
        description="Are you sure?"
        cancelLabel="Dismiss"
        onConfirm={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Dismiss' });
    fireEvent.click(cancelButton);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});

