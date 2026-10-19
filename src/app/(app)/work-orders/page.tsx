'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, RotateCw } from 'lucide-react';

import { useWorkOrders } from '@/hooks/use-work-orders';
import { WorkOrderFilters } from '@/components/work-orders/work-order-filters';
import { WorkOrderTable } from '@/components/work-orders/work-order-table';
import { Button } from '@/components/ui/button';
import {
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderCategory,
} from '@/types/work-orders';

export default function WorkOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<WorkOrderStatus | undefined>();
  const [priority, setPriority] = useState<WorkOrderPriority | undefined>();
  const [category, setCategory] = useState<WorkOrderCategory | undefined>();

  const { data, isLoading, isError, refetch, isRefetching } = useWorkOrders({
    page,
    limit: 15,
    search: search.trim() || undefined,
    status,
    priority,
    category,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const handleReset = () => {
    setSearch('');
    setStatus(undefined);
    setPriority(undefined);
    setCategory(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Work Orders</h2>
          <p className="text-sm text-muted-foreground">
            Manage, dispatch, and track facility maintenance work orders
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

          <Button asChild size="sm">
            <Link href="/work-orders/new" className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              New Work Order
            </Link>
          </Button>
        </div>
      </div>

      <WorkOrderFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        priority={priority}
        onPriorityChange={(val) => {
          setPriority(val);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between"
        >
          <span>Error loading work orders from server.</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      <WorkOrderTable
        orders={data?.data || []}
        pagination={data?.meta?.pagination}
        isLoading={isLoading}
        onPageChange={setPage}
      />
    </div>
  );
}

