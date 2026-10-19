'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  Calendar,
  Clock,
  User as UserIcon,
  MapPin,
  Box,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { useWorkOrderDetail } from '@/hooks/use-work-orders';
import { StatusBadge } from '@/components/shared/status-badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

import { AITriagePanel } from '@/components/work-orders/ai-triage-panel';
import { StatusTransitionControls } from '@/components/work-orders/status-transition-dialogs';
import { AssignTechnicianDialog } from '@/components/work-orders/assign-technician-dialog';
import { WorkNotesSection } from '@/components/work-orders/work-notes-section';
import { WorkCostsSection } from '@/components/work-orders/work-costs-section';
import { WorkOrderTimeline } from '@/components/work-orders/work-order-timeline';
import { ImageGallery } from '@/components/work-orders/image-gallery';

export default function WorkOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { user } = useAuthStore();
  const { data: order, isLoading, isError, refetch } = useWorkOrderDetail(id);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" label="Loading work order details..." />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">Work Order Not Found</h3>
        <p className="text-sm text-muted-foreground">
          The requested work order does not exist or you do not have permission to view it.
        </p>
        <Button asChild variant="outline">
          <Link href="/work-orders">Return to Work Orders</Link>
        </Button>
      </div>
    );
  }

  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const currency = user?.organization?.defaultCurrency || 'BDT';

  const isOverdue =
    order.dueAt &&
    new Date(order.dueAt) < new Date() &&
    order.status !== 'RESOLVED' &&
    order.status !== 'CLOSED' &&
    order.status !== 'CANCELLED';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-7 px-2">
              <Link href="/work-orders">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Work Orders
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground font-mono">
              #{order.id.slice(0, 8)}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {order.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isManagerOrAdmin && (
            <AssignTechnicianDialog
              workOrderId={order.id}
              currentAssigneeId={order.assigneeId || order.assignee?.id}
            />
          )}
          <StatusTransitionControls workOrder={order} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={order.status} />
        <PriorityBadge priority={order.priority} />
        <span className="rounded bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
          {order.category.replace('_', ' ')}
        </span>

        {isOverdue && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/30">
            <AlertTriangle className="h-3 w-3" />
            Overdue SLA
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="font-semibold text-sm">{order.location?.name || '—'}</p>
            {order.location?.building && (
              <p className="text-xs text-muted-foreground">
                Building {order.location.building}
                {order.location.floor ? `, Floor ${order.location.floor}` : ''}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Box className="h-3.5 w-3.5" />
              Asset / Equipment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="font-semibold text-sm">
              {order.asset ? order.asset.name : 'No linked asset'}
            </p>
            {order.asset && (
              <p className="text-xs text-muted-foreground font-mono">
                Code: {order.asset.assetCode}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              Assigned Technician
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="font-semibold text-sm">
              {order.assignee ? order.assignee.fullName : 'Unassigned'}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.assignee ? order.assignee.email : 'Awaiting assignment'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Target Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="font-semibold text-sm">
              {order.dueAt ? formatDateTime(order.dueAt) : 'No due target set'}
            </p>
            {order.dueAt && (
              <p className="text-xs text-muted-foreground">
                {isOverdue ? 'Expired ' : 'Due '} {formatRelativeTime(order.dueAt)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Incident Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
            {order.description}
          </p>

          {order.resolutionSummary && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 font-semibold text-sm text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Resolution Summary
              </div>
              <p className="mt-1 text-xs text-emerald-950 dark:text-emerald-100 whitespace-pre-wrap">
                {order.resolutionSummary}
              </p>
              {order.resolvedAt && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Resolved on {formatDateTime(order.resolvedAt)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AITriagePanel workOrderId={order.id} aiAnalysis={order.aiAnalysis} />

      <ImageGallery
        workOrderId={order.id}
        images={order.images || []}
        canUpload={order.status !== 'CLOSED' && order.status !== 'CANCELLED'}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WorkNotesSection workOrderId={order.id} notes={order.workNotes || order.notes || []} />
        <WorkCostsSection
          workOrderId={order.id}
          costs={order.costs || []}
          currency={currency}
          canEdit={order.status !== 'CLOSED' && order.status !== 'CANCELLED'}
        />
      </div>

      <WorkOrderTimeline history={order.statusHistory || []} />
    </div>
  );
}
