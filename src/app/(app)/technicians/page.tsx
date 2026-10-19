'use client';

import { useState } from 'react';
import { Users, Phone, Mail, CheckCircle, RotateCw, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTechnicians, useCreateInvitationMutation } from '@/hooks/use-entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { formatApiError, showErrorToast } from '@/lib/api-errors';

export default function TechniciansPage() {
  const { data: technicians = [], isLoading, isError, refetch, isRefetching } = useTechnicians();
  const createInviteMutation = useCreateInvitationMutation();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

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

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) {
      toast.error('Email is required', {
        description: 'Please enter a technician email address to invite',
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email format', {
        description: 'Please provide a valid email address (e.g., name@domain.com)',
      });
      return;
    }

    try {
      await createInviteMutation.mutateAsync({
        email,
        role: 'TECHNICIAN',
      });
      toast.success(`Technician invitation sent to ${email}`);
      setInviteEmail('');
      setIsInviteOpen(false);
    } catch (err) {
      showErrorToast(err, 'Failed to send technician invitation');
    }
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

          <Button size="sm" onClick={() => setIsInviteOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Invite Technician
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
          description="Send an invitation to onboard your first field technician"
          action={{
            label: 'Invite Technician',
            onClick: () => setIsInviteOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((tech) => (
            <Card key={tech.id} className="border-border/60 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base font-semibold truncate">
                      {tech.fullName}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{tech.email}</span>
                    </div>
                  </div>
                  {getWorkloadBadge(tech.activeJobCount)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {tech.phone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
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

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSendInvite}>
            <DialogHeader>
              <DialogTitle>Invite Technician</DialogTitle>
              <DialogDescription>
                Send an email invitation to onboard a new technician to your organization.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="techEmail">Technician Email</Label>
                <Input
                  id="techEmail"
                  type="email"
                  placeholder="technician@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={createInviteMutation.isPending}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Assigned Role</Label>
                <div>
                  <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold">
                    TECHNICIAN
                  </Badge>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteOpen(false)}
                disabled={createInviteMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createInviteMutation.isPending}>
                {createInviteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
