import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'warning' | 'destructive' | 'success';
  isLoading?: boolean;
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10 text-primary',
    valueText: 'text-foreground',
  },
  warning: {
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    valueText: 'text-foreground',
  },
  destructive: {
    iconBg: 'bg-destructive/10 text-destructive',
    valueText: 'text-destructive',
  },
  success: {
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    valueText: 'text-foreground',
  },
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
  isLoading = false,
}: MetricCardProps) {
  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 my-1" />
            ) : (
              <p className={cn('text-2xl font-bold tracking-tight', styles.valueText)}>
                {value}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', styles.iconBg)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

