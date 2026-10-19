'use client';

import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Mail,
  UserCheck,
  Activity,
  ArrowRight,
  RotateCw,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useNotifications,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/hooks/use-entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { NotificationType } from '@/types/entities';

const notificationIconMap: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  WORK_ORDER_ASSIGNED: { icon: UserCheck, color: 'text-indigo-600 dark:text-indigo-400' },
  WORK_ORDER_STATUS_CHANGED: { icon: Activity, color: 'text-blue-600 dark:text-blue-400' },
  WORK_ORDER_OVERDUE: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400' },
  DEADLINE_APPROACHING: { icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
  AI_ANALYSIS_COMPLETED: { icon: Sparkles, color: 'text-purple-600 dark:text-purple-400' },
  AI_ANALYSIS_FAILED: { icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-400' },
  RECURRING_FAULT_DETECTED: { icon: ShieldAlert, color: 'text-orange-600 dark:text-orange-400' },
  INVITATION_RECEIVED: { icon: Mail, color: 'text-emerald-600 dark:text-emerald-400' },
};

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useNotifications({ limit: 50 });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
    } catch {
      toast.error('Failed to mark notification');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Activity updates, SLA alerts, and AI dispatch notifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RotateCw className={`h-4 w-4 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Failed to load notifications. Please refresh.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You do not have any notifications at this time."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const isRead = Boolean(notification.readAt);
            const iconConfig = notificationIconMap[notification.type] || {
              icon: Bell,
              color: 'text-primary',
            };
            const Icon = iconConfig.icon;

            return (
              <div
                key={notification.id}
                className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
                  isRead ? 'bg-card' : 'bg-primary/5 border-primary/20 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted ${iconConfig.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm ${
                          isRead ? 'font-medium text-foreground' : 'font-bold text-foreground'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      {!isRead && (
                        <span
                          className="h-2 w-2 rounded-full bg-primary shrink-0"
                          title="Unread"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notification.body}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                      <span>{formatRelativeTime(notification.createdAt)}</span>
                      {notification.workOrderId && (
                        <Link
                          href={`/work-orders/${notification.workOrderId}`}
                          className="text-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          View Work Order
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground shrink-0 ml-2"
                    onClick={() => handleMarkOne(notification.id)}
                    disabled={markReadMutation.isPending}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

