import * as React from 'react';
import { WorkOrderPriority } from '@/types/work-orders';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface PriorityBadgeProps {
  priority: WorkOrderPriority;
  className?: string;
  showIcon?: boolean;
}

const priorityConfig: Record<
  WorkOrderPriority,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  CRITICAL: {
    label: 'Critical',
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-500/30',
    icon: AlertCircle,
  },
  HIGH: {
    label: 'High',
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-500/30',
    icon: ArrowUp,
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/30',
    icon: Minus,
  },
  LOW: {
    label: 'Low',
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500/30',
    icon: ArrowDown,
  },
};

export function PriorityBadge({
  priority,
  className,
  showIcon = true,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority] || {
    label: priority,
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    icon: Minus,
  };

  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && <IconComponent className="h-3 w-3 shrink-0" />}
      {config.label}
    </span>
  );
}

