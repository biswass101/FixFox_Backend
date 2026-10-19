import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  locationsApi,
  LocationQueryParams,
  CreateLocationInput,
  UpdateLocationInput,
} from '@/lib/api/locations.api';
import {
  assetsApi,
  AssetQueryParams,
  CreateAssetInput,
  UpdateAssetInput,
} from '@/lib/api/assets.api';
import { techniciansApi } from '@/lib/api/technicians.api';
import {
  notificationsApi,
  NotificationQueryParams,
} from '@/lib/api/notifications.api';
import {
  invitationsApi,
  CreateInvitationInput,
} from '@/lib/api/invitations.api';

export const ENTITY_QUERY_KEYS = {
  locations: ['locations'] as const,
  assets: ['assets'] as const,
  technicians: ['technicians'] as const,
  notifications: ['notifications'] as const,
  unreadNotifications: ['notifications', 'unread-count'] as const,
  invitations: ['invitations'] as const,
};

export function useLocations(params?: LocationQueryParams) {
  return useQuery({
    queryKey: [...ENTITY_QUERY_KEYS.locations, params],
    queryFn: () => locationsApi.list(params),
    staleTime: 60 * 1000,
  });
}

export function useCreateLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLocationInput) => locationsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.locations });
    },
  });
}

export function useUpdateLocationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateLocationInput) => locationsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.locations });
    },
  });
}

export function useDeleteLocationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.locations });
    },
  });
}

export function useAssets(params?: AssetQueryParams) {
  return useQuery({
    queryKey: [...ENTITY_QUERY_KEYS.assets, params],
    queryFn: () => assetsApi.list(params),
    staleTime: 60 * 1000,
  });
}

export function useCreateAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAssetInput) => assetsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.assets });
    },
  });
}

export function useUpdateAssetMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAssetInput) => assetsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.assets });
    },
  });
}

export function useDeleteAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.assets });
    },
  });
}

export function useTechnicians() {
  return useQuery({
    queryKey: ENTITY_QUERY_KEYS.technicians,
    queryFn: () => techniciansApi.list(),
    staleTime: 60 * 1000,
  });
}

export function useNotifications(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: [...ENTITY_QUERY_KEYS.notifications, params],
    queryFn: () => notificationsApi.list(params),
    staleTime: 15 * 1000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ENTITY_QUERY_KEYS.unreadNotifications,
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 15 * 1000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.notifications });
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.unreadNotifications });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.notifications });
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.unreadNotifications });
    },
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: ENTITY_QUERY_KEYS.invitations,
    queryFn: () => invitationsApi.list(),
    staleTime: 30 * 1000,
  });
}

export function useCreateInvitationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvitationInput) => invitationsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.invitations });
    },
  });
}

export function useRevokeInvitationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationsApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEYS.invitations });
    },
  });
}
