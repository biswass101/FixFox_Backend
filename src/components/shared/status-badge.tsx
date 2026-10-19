import * as React from 'react';
import { WorkOrderStatus } from '@/types/work-orders';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: WorkOrderStatus;
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<
  WorkOrderStatus,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  OPEN: {
    label: 'Open',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
    border: 'border-blue-500/30',
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-700 dark:text-indigo-300',
    dot: 'bg-indigo-500',
    border: 'border-indigo-500/30',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    border: 'border-amber-500/30',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500/30',
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-500',
    border: 'border-slate-500/30',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    border: 'border-rose-500/30',
  },
};

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
    border: 'border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', config.dot)}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  );
}

