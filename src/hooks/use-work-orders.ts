import { useQuery } from '@tanstack/react-query';
import { workOrdersApi, WorkOrderQueryParams } from '@/lib/api/work-orders.api';

export const WORK_ORDERS_QUERY_KEY = ['work-orders'] as const;

export function useWorkOrders(params?: WorkOrderQueryParams) {
  return useQuery({
    queryKey: [...WORK_ORDERS_QUERY_KEY, params],
    queryFn: () => workOrdersApi.list(params),
    staleTime: 30 * 1000,
  });
}

