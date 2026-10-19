'use client';

import Link from 'next/link';
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RotateCw,
} from 'lucide-react';

import { useWorkOrders } from '@/hooks/use-work-orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { WorkOrder } from '@/types/work-orders';

export default function SLAPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useWorkOrders({
    limit: 50,
    sortBy: 'dueAt',
    sortOrder: 'asc',
  });

  const orders = data?.data || [];

  const getSLAStatus = (order: WorkOrder) => {
    if (order.status === 'RESOLVED' || order.status === 'CLOSED') {
      if (order.dueAt && order.resolvedAt) {
        const resolved = new Date(order.resolvedAt);
        const due = new Date(order.dueAt);
        if (resolved <= due) {
          return { label: 'Resolved within SLA', variant: 'success' as const, icon: CheckCircle2 };
        }
        return { label: 'Resolved Late', variant: 'warning' as const, icon: Clock };
      }
      return { label: 'Completed', variant: 'secondary' as const, icon: CheckCircle2 };
    }

    if (!order.dueAt) {
      return { label: 'No Deadline', variant: 'secondary' as const, icon: Clock };
    }

    const now = new Date().getTime();
    const dueTime = new Date(order.dueAt).getTime();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { label: 'Overdue', variant: 'destructive' as const, icon: AlertCircle };
    }
    if (diffHours <= 4) {
      return { label: 'Due Soon', variant: 'warning' as const, icon: AlertTriangle };
    }
    return { label: 'On Track', variant: 'success' as const, icon: CheckCircle2 };
  };

  const overdueCount = orders.filter((o) => {
    const s = getSLAStatus(o);
    return s.label === 'Overdue';
  }).length;

  const dueSoonCount = orders.filter((o) => {
    const s = getSLAStatus(o);
    return s.label === 'Due Soon';
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SLA & Incident Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Track service-level agreement commitments, resolution targets, and escalation risks
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-red-500/30 bg-red-500/5">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              SLA Breaches (Overdue)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
            <p className="text-xs text-muted-foreground">Active jobs requiring immediate dispatch</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500/30 bg-amber-500/5">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Approaching Deadline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{dueSoonCount}</p>
            <p className="text-xs text-muted-foreground">Expiring within 4 hours</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              Critical SLA Target
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold">15 min</p>
            <p className="text-xs text-muted-foreground">Response requirement for emergencies</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-primary" />
              High Priority SLA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold">2 hours</p>
            <p className="text-xs text-muted-foreground">Standard dispatch SLA for urgent repairs</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Active Work Order SLA Status</CardTitle>
          <CardDescription>
            Live monitoring of time remaining until resolution commitment deadlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isError && (
            <div
              role="alert"
              className="p-3 text-xs rounded bg-destructive/10 text-destructive mb-4"
            >
              Failed to load SLA active orders.
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2 border-b last:border-0">
                  <Skeleton className="h-4 w-60" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 italic">
              No active work orders currently scheduled.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Assigned Technician</TableHead>
                  <TableHead>Target Due Time</TableHead>
                  <TableHead className="text-right">SLA State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const sla = getSLAStatus(order);
                  const SlaIcon = sla.icon;

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold text-sm">
                        <Link
                          href={`/work-orders/${order.id}`}
                          className="hover:underline text-foreground block max-w-xs truncate"
                        >
                          {order.title}
                        </Link>
                        <span className="text-xs text-muted-foreground font-mono">
                          #{order.id.slice(0, 8)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={order.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {order.assignee?.fullName || 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {order.dueAt ? (
                          <div>
                            <div>{formatDateTime(order.dueAt)}</div>
                            <div className="text-[11px] opacity-80">
                              {formatRelativeTime(order.dueAt)}
                            </div>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={sla.variant} className="inline-flex items-center gap-1 text-[11px]">
                          <SlaIcon className="h-3 w-3" />
                          {sla.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

