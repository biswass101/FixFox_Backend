'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';
import { WorkOrder } from '@/types/work-orders';
import { PaginationMeta } from '@/types/api';

interface WorkOrderTableProps {
  orders: WorkOrder[];
  pagination?: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function WorkOrderTable({
  orders,
  pagination,
  isLoading,
  onPageChange,
}: WorkOrderTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-2 border rounded-lg p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No work orders match criteria"
        description="Try adjusting your filters or search keywords to find what you are looking for."
        action={{
          label: 'Create work order',
          onClick: () => router.push('/work-orders/new'),
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Order & Description</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead className="text-right">Reported</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/work-orders/${order.id}`)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground truncate max-w-[280px]">
                      {order.title}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      #{order.id.slice(0, 8)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div>{order.location?.name || '—'}</div>
                  {order.asset && (
                    <div className="text-xs text-muted-foreground/80 font-mono">
                      Asset: {order.asset.assetCode}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  <span className="rounded bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                    {order.category.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={order.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-sm">
                  {order.assignee ? (
                    <span className="font-medium text-foreground">
                      {order.assignee.fullName}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <div>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

