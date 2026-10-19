'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isLoading && (isError || !user || !isAuthenticated)) {
      router.replace('/login');
    }
  }, [isLoading, isError, user, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Authenticating session..." />
      </div>
    );
  }

  if (!user && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

