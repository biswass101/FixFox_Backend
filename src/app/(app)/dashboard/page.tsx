'use client';

import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  RotateCw,
} from 'lucide-react';

import {
  useAnalyticsOverview,
  useAnalyticsByCategory,
  useAnalyticsByPriority,
} from '@/hooks/use-analytics';
import { useWorkOrders } from '@/hooks/use-work-orders';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/utils';
import { MetricCard } from '@/components/dashboard/metric-card';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { RecentWorkOrders } from '@/components/dashboard/recent-work-orders';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const overviewQuery = useAnalyticsOverview();
  const categoryQuery = useAnalyticsByCategory();
  const priorityQuery = useAnalyticsByPriority();
  const recentOrdersQuery = useWorkOrders({
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const isLoading =
    overviewQuery.isLoading ||
    categoryQuery.isLoading ||
    priorityQuery.isLoading;

  const isError =
    overviewQuery.isError ||
    categoryQuery.isError ||
    priorityQuery.isError;

  const refetchAll = () => {
    overviewQuery.refetch();
    categoryQuery.refetch();
    priorityQuery.refetch();
    recentOrdersQuery.refetch();
  };

  const overview = overviewQuery.data;
  const currency = user?.organization?.defaultCurrency || 'BDT';

  const activeCount = overview?.countsByStatus
    ? overview.countsByStatus.open +
      overview.countsByStatus.assigned +
      overview.countsByStatus.inProgress
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Real-time status of your facility operations and maintenance pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            disabled={overviewQuery.isRefetching}
            className="flex items-center gap-1.5"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${overviewQuery.isRefetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {isError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <div>
            <p className="font-semibold">Unable to fetch dashboard metrics</p>
            <p className="text-xs opacity-90">
              There was an error reaching the analytics service. Please verify your connection.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={refetchAll}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Orders"
          value={overview?.totalWorkOrders ?? 0}
          icon={ClipboardList}
          description="All recorded work orders"
          isLoading={isLoading}
        />
        <MetricCard
          title="Active Orders"
          value={activeCount}
          icon={Clock}
          variant="warning"
          description="Open, assigned, or in-flight"
          isLoading={isLoading}
        />
        <MetricCard
          title="Overdue"
          value={overview?.overdueCount ?? 0}
          icon={AlertTriangle}
          variant={(overview?.overdueCount ?? 0) > 0 ? 'destructive' : 'default'}
          description="Past SLA due date"
          isLoading={isLoading}
        />
        <MetricCard
          title="Avg Resolution"
          value={`${overview?.meanTimeToResolveHours ?? 0}h`}
          icon={CheckCircle2}
          variant="success"
          description="Mean time to resolution"
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Costs"
          value={formatCurrency(overview?.totalMaintenanceCost ?? 0, currency)}
          icon={DollarSign}
          description="Materials & labor spend"
          isLoading={isLoading}
        />
      </div>

      <DashboardCharts
        categories={categoryQuery.data || []}
        priorities={priorityQuery.data || []}
        isLoading={categoryQuery.isLoading || priorityQuery.isLoading}
      />

      <RecentWorkOrders
        orders={recentOrdersQuery.data?.data || []}
        isLoading={recentOrdersQuery.isLoading}
      />
    </div>
  );
}

