import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

describe('LoadingSpinner component', () => {
  it('renders default loading status', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom label when provided', () => {
    render(<LoadingSpinner label="Fetching tickets..." />);
    expect(screen.getAllByText('Fetching tickets...').length).toBeGreaterThanOrEqual(1);
  });
});

