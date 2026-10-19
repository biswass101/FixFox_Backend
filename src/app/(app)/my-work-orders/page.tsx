'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Play,
  RotateCw,
} from 'lucide-react';

import { useWorkOrders } from '@/hooks/use-work-orders';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { WorkOrderStatus } from '@/types/work-orders';

export default function MyWorkOrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'ALL'>('ALL');

  const { data, isLoading, isError, refetch, isRefetching } = useWorkOrders({
    assigneeId: user?.id,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    sortBy: 'priority',
    sortOrder: 'desc',
    limit: 50,
  });

  const orders = data?.data || [];

  const inProgressOrders = orders.filter((o) => o.status === 'IN_PROGRESS');
  const assignedOrders = orders.filter((o) => o.status === 'ASSIGNED');
  const overdueOrders = orders.filter(
    (o) =>
      o.dueAt &&
      new Date(o.dueAt) < new Date() &&
      o.status !== 'RESOLVED' &&
      o.status !== 'CLOSED'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Technician Workbench</h2>
          <p className="text-sm text-muted-foreground">
            Your active assigned jobs, priority tasks, and scheduled work orders
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RotateCw className={`h-4 w-4 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-sm border-blue-500/20 bg-blue-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4" />
              Assigned Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{assignedOrders.length}</p>
            <p className="text-xs text-muted-foreground">Ready to start work</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500/20 bg-amber-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Play className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{inProgressOrders.length}</p>
            <p className="text-xs text-muted-foreground">Currently underway</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-red-500/20 bg-red-500/5">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Overdue Deadline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-bold text-destructive">{overdueOrders.length}</p>
            <p className="text-xs text-muted-foreground">Requires immediate priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 border-b pb-3">
        {(['ALL', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            onClick={() => setStatusFilter(s)}
            className="text-xs"
          >
            {s === 'ALL' ? 'All Assigned' : s.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Failed to load technician jobs. Please refresh.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No jobs in your queue"
          description="You currently have no work orders matching this filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {orders.map((order) => {
            const orderIsOverdue =
              order.dueAt &&
              new Date(order.dueAt) < new Date() &&
              order.status !== 'RESOLVED' &&
              order.status !== 'CLOSED';

            return (
              <Card
                key={order.id}
                className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
                onClick={() => router.push(`/work-orders/${order.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                      <CardTitle className="text-base font-semibold leading-snug">
                        {order.title}
                      </CardTitle>
                    </div>
                    <PriorityBadge priority={order.priority} />
                  </div>
                  <CardDescription className="line-clamp-2 text-xs pt-1">
                    {order.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t pt-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      <span>{order.location?.name || 'Main Facility'}</span>
                    </div>

                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {order.dueAt ? (
                        <span className={orderIsOverdue ? 'text-destructive font-bold' : ''}>
                          {orderIsOverdue ? 'Overdue ' : 'Due '}
                          {formatRelativeTime(order.dueAt)}
                        </span>
                      ) : (
                        <span>No deadline</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

