import { useQuery } from '@tanstack/react-query';
import { locationsApi, LocationQueryParams } from '@/lib/api/locations.api';
import { assetsApi, AssetQueryParams } from '@/lib/api/assets.api';
import { techniciansApi } from '@/lib/api/technicians.api';

export const ENTITY_QUERY_KEYS = {
  locations: ['locations'] as const,
  assets: ['assets'] as const,
  technicians: ['technicians'] as const,
};

export function useLocations(params?: LocationQueryParams) {
  return useQuery({
    queryKey: [...ENTITY_QUERY_KEYS.locations, params],
    queryFn: () => locationsApi.list(params),
    staleTime: 60 * 1000,
  });
}

export function useAssets(params?: AssetQueryParams) {
  return useQuery({
    queryKey: [...ENTITY_QUERY_KEYS.assets, params],
    queryFn: () => assetsApi.list(params),
    staleTime: 60 * 1000,
  });
}

export function useTechnicians() {
  return useQuery({
    queryKey: ENTITY_QUERY_KEYS.technicians,
    queryFn: () => techniciansApi.list(),
    staleTime: 60 * 1000,
  });
}

