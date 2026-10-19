import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PriorityBadge } from '@/components/shared/priority-badge';

describe('PriorityBadge', () => {
  it('renders CRITICAL priority correctly', () => {
    render(<PriorityBadge priority="CRITICAL" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders HIGH priority correctly', () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders MEDIUM priority correctly', () => {
    render(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders LOW priority correctly', () => {
    render(<PriorityBadge priority="LOW" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});

