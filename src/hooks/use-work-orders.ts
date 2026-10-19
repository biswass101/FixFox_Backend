import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  workOrdersApi,
  WorkOrderQueryParams,
  CreateWorkOrderInput,
  UpdateWorkOrderInput,
  AssignTechnicianInput,
  UpdateStatusInput,
  ResolveWorkOrderInput,
  ReopenWorkOrderInput,
  CreateNoteInput,
  CreateCostInput,
  ReviewAITriageInput,
} from '@/lib/api/work-orders.api';

export const WORK_ORDERS_QUERY_KEY = ['work-orders'] as const;

export function useWorkOrders(params?: WorkOrderQueryParams) {
  return useQuery({
    queryKey: [...WORK_ORDERS_QUERY_KEY, params],
    queryFn: () => workOrdersApi.list(params),
    staleTime: 30 * 1000,
  });
}

export function useWorkOrderDetail(id: string) {
  return useQuery({
    queryKey: [...WORK_ORDERS_QUERY_KEY, id],
    queryFn: () => workOrdersApi.getById(id),
    enabled: !!id,
    staleTime: 15 * 1000,
  });
}

export function useCreateWorkOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkOrderInput) => workOrdersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateWorkOrderMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateWorkOrderInput) => workOrdersApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
    },
  });
}

export function useAssignTechnicianMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignTechnicianInput) => workOrdersApi.assign(workOrderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
      queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateStatusMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStatusInput) => workOrdersApi.updateStatus(workOrderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
      queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useResolveWorkOrderMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ResolveWorkOrderInput) => workOrdersApi.resolve(workOrderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
      queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useReopenWorkOrderMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReopenWorkOrderInput) => workOrdersApi.reopen(workOrderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
      queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useCloseWorkOrderMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => workOrdersApi.close(workOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
      queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useCancelWorkOrderMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason?: string) => workOrdersApi.cancel(workOrderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
      queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useCreateNoteMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => workOrdersApi.createNote(workOrderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
    },
  });
}

export function useCreateCostMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCostInput) => workOrdersApi.createCost(workOrderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteCostMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (costId: string) => workOrdersApi.deleteCost(workOrderId, costId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUploadImageMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => workOrdersApi.uploadImage(workOrderId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
    },
  });
}

export function useReviewAITriageMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReviewAITriageInput) =>
      workOrdersApi.reviewAITriage(workOrderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
    },
  });
}

export function useRetryAITriageMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => workOrdersApi.retryAITriage(workOrderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
    },
  });
}
