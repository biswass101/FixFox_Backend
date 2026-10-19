import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics.api';

export const ANALYTICS_QUERY_KEYS = {
  overview: ['analytics', 'overview'] as const,
  byCategory: ['analytics', 'by-category'] as const,
  byPriority: ['analytics', 'by-priority'] as const,
  trends: ['analytics', 'trends'] as const,
  technicianPerformance: ['analytics', 'technician-performance'] as const,
};

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.overview,
    queryFn: () => analyticsApi.getOverview(),
    staleTime: 60 * 1000,
  });
}

export function useAnalyticsByCategory() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.byCategory,
    queryFn: () => analyticsApi.getByCategory(),
    staleTime: 60 * 1000,
  });
}

export function useAnalyticsByPriority() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.byPriority,
    queryFn: () => analyticsApi.getByPriority(),
    staleTime: 60 * 1000,
  });
}

export function useAnalyticsTrends() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.trends,
    queryFn: () => analyticsApi.getTrends(),
    staleTime: 60 * 1000,
  });
}

export function useTechnicianPerformance() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.technicianPerformance,
    queryFn: () => analyticsApi.getTechnicianPerformance(),
    staleTime: 60 * 1000,
  });
}
