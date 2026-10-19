'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  RotateCw,
  Award,
} from 'lucide-react';

import {
  useAnalyticsOverview,
  useAnalyticsByCategory,
  useAnalyticsByPriority,
  useAnalyticsTrends,
  useTechnicianPerformance,
} from '@/hooks/use-analytics';
import { useAuthStore } from '@/stores/auth.store';
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
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const overviewQuery = useAnalyticsOverview();
  const categoryQuery = useAnalyticsByCategory();
  const priorityQuery = useAnalyticsByPriority();
  const trendsQuery = useAnalyticsTrends();
  const techQuery = useTechnicianPerformance();

  const isLoading =
    overviewQuery.isLoading ||
    categoryQuery.isLoading ||
    priorityQuery.isLoading ||
    trendsQuery.isLoading;

  const overview = overviewQuery.data;
  const currency = user?.organization?.defaultCurrency || 'BDT';

  const refetchAll = () => {
    overviewQuery.refetch();
    categoryQuery.refetch();
    priorityQuery.refetch();
    trendsQuery.refetch();
    techQuery.refetch();
  };

  const trendsData = (trendsQuery.data || []).map((t) => ({
    date: t.date.slice(5),
    Created: t.created,
    Resolved: t.resolved,
  }));

  const categoryData = (categoryQuery.data || []).slice(0, 8).map((c) => ({
    name: c.category.replace('_', ' '),
    count: c.count,
  }));

  const priorityData = (priorityQuery.data || []).map((p) => ({
    name: p.priority,
    count: p.count,
  }));

  const techPerformance = techQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Facility Analytics & Reports</h2>
          <p className="text-sm text-muted-foreground">
            Operational maintenance performance, resolution benchmarks, and expenditure insights
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetchAll}
          disabled={overviewQuery.isRefetching}
        >
          <RotateCw className={`h-4 w-4 mr-1.5 ${overviewQuery.isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold">{overview?.totalWorkOrders ?? 0}</p>
            )}
            <p className="text-xs text-muted-foreground">Recorded across all facilities</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Mean Time to Resolve
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold">{overview?.meanTimeToResolveHours ?? 0}h</p>
            )}
            <p className="text-xs text-muted-foreground">Average incident resolution duration</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary" />
              Total Maintenance Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="text-2xl font-bold">
                {formatCurrency(overview?.totalMaintenanceCost ?? 0, currency)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">Aggregated parts and technician labor</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Overdue Target SLA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-destructive">
                {overview?.overdueCount ?? 0}
              </p>
            )}
            <p className="text-xs text-muted-foreground">Work orders past target resolution time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Incident Volume Trends</CardTitle>
          <CardDescription>Created vs Resolved work order volume over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            {!isMounted || trendsQuery.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : trendsData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No historical trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--card-foreground))',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Created"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#createdGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Resolved"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#resolvedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Volume by Priority</CardTitle>
            <CardDescription>Incidents classified by SLA urgency rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {!isMounted || priorityQuery.isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : priorityData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No priority data recorded
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Volume by Category</CardTitle>
            <CardDescription>Maintenance demand by facility trade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {!isMounted || categoryQuery.isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : categoryData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No category data recorded
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">
              Technician Performance & MTTR
            </CardTitle>
          </div>
          <CardDescription>
            Individual technician job assignments, completions, and mean turnaround times
          </CardDescription>
        </CardHeader>
        <CardContent>
          {techQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : techPerformance.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 italic">
              No technician activity performance logs recorded.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Assigned Orders</TableHead>
                  <TableHead className="text-right">Resolved Orders</TableHead>
                  <TableHead className="text-right">Avg MTTR (Hours)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {techPerformance.map((tech) => (
                  <TableRow key={tech.technicianId}>
                    <TableCell className="font-semibold text-foreground">
                      {tech.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {tech.email}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {tech.assignedCount}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {tech.resolvedCount}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {tech.mttrHours}h
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

