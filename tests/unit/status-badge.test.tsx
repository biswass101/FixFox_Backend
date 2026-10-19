import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '@/components/shared/status-badge';

describe('StatusBadge', () => {
  it('renders OPEN status correctly', () => {
    render(<StatusBadge status="OPEN" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders IN_PROGRESS status correctly', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders RESOLVED status correctly', () => {
    render(<StatusBadge status="RESOLVED" />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders CANCELLED status correctly', () => {
    render(<StatusBadge status="CANCELLED" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});

