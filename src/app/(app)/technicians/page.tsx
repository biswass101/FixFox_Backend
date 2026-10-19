'use client';

import Link from 'next/link';
import { Users, Phone, Mail, CheckCircle, RotateCw, Plus } from 'lucide-react';
import { useTechnicians } from '@/hooks/use-entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';

export default function TechniciansPage() {
  const { data: technicians = [], isLoading, isError, refetch, isRefetching } = useTechnicians();

  const getWorkloadBadge = (activeCount: number) => {
    if (activeCount === 0) {
      return <Badge variant="secondary">Available</Badge>;
    }
    if (activeCount <= 2) {
      return <Badge variant="success">Light Load ({activeCount})</Badge>;
    }
    if (activeCount <= 5) {
      return <Badge variant="warning">Moderate ({activeCount})</Badge>;
    }
    return <Badge variant="destructive">High Load ({activeCount})</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance Technicians</h2>
          <p className="text-sm text-muted-foreground">
            Field technicians, specialized skills, and active job dispatch workloads
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
            <Link href="/settings">
              <Plus className="h-4 w-4 mr-1.5" />
              Invite Technician
            </Link>
          </Button>
        </div>
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Failed to load technician roster. Please refresh.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-1.5 pt-2">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : technicians.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No technicians registered"
          description="Send team invitations to onboarding technicians to start assigning maintenance tasks."
          action={{
            label: 'Invite technician',
            onClick: () => {
              window.location.href = '/settings';
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((tech) => (
            <Card key={tech.id} className="shadow-sm hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {tech.fullName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs mt-1">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{tech.email}</span>
                    </CardDescription>
                  </div>
                  {getWorkloadBadge(tech.activeJobCount)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {tech.phone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{tech.phone}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Specialized Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tech.skills && tech.skills.length > 0 ? (
                      tech.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        General Maintenance
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-muted-foreground">Active Work Orders:</span>
                  <span className="font-bold text-foreground">{tech.activeJobCount}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

