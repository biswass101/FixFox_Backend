'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function RootPage() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { isAuthenticated, isLoading: isStoreLoading } = useAuthStore();

  const loading = isUserLoading || isStoreLoading;

  useEffect(() => {
    if (!loading) {
      if (user || isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isAuthenticated, loading, router]);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isAuthenticated && !user) {
        router.replace('/login');
      }
    }, 2500);

    return () => clearTimeout(fallbackTimer);
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingSpinner size="lg" label="Loading FixFlow..." />
    </div>
  );
}
