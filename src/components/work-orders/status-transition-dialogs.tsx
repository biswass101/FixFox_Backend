'use client';

import { useState } from 'react';
import { Play, CheckCheck, RotateCcw, Ban, Archive } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { WorkOrder, WorkOrderStatus } from '@/types/work-orders';
import {
  useUpdateStatusMutation,
  useResolveWorkOrderMutation,
  useReopenWorkOrderMutation,
  useCloseWorkOrderMutation,
  useCancelWorkOrderMutation,
} from '@/hooks/use-work-orders';
import { useAuthStore } from '@/stores/auth.store';
import { formatApiError } from '@/lib/api-errors';

interface StatusTransitionControlsProps {
  workOrder: WorkOrder;
}

export function StatusTransitionControls({ workOrder }: StatusTransitionControlsProps) {
  const { user } = useAuthStore();
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const updateStatusMutation = useUpdateStatusMutation(workOrder.id);
  const resolveMutation = useResolveWorkOrderMutation(workOrder.id);
  const reopenMutation = useReopenWorkOrderMutation(workOrder.id);
  const closeMutation = useCloseWorkOrderMutation(workOrder.id);
  const cancelMutation = useCancelWorkOrderMutation(workOrder.id);

  const role = user?.role;
  const isManagerOrAdmin = role === 'ADMIN' || role === 'MANAGER';
  const isAssignedTech =
    role === 'TECHNICIAN' &&
    ((workOrder.assigneeId && workOrder.assigneeId === user?.id) ||
      (workOrder.assignee && workOrder.assignee.id === user?.id));
  const canUpdate = isManagerOrAdmin || isAssignedTech;

  if (!canUpdate) return null;

  const handleStartWork = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        status: 'IN_PROGRESS',
        version: workOrder.version,
      });
      toast.success('Work order marked In Progress');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resolutionSummary.trim().length < 5) {
      toast.error('Resolution summary must be at least 5 characters');
      return;
    }
    try {
      await resolveMutation.mutateAsync({ resolutionSummary });
      setResolveOpen(false);
      toast.success('Work order marked as Resolved');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reopenReason.trim().length < 5) {
      toast.error('Reopen reason must be at least 5 characters');
      return;
    }
    try {
      await reopenMutation.mutateAsync({ reason: reopenReason });
      setReopenOpen(false);
      toast.success('Work order reopened');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleClose = async () => {
    try {
      await closeMutation.mutateAsync();
      toast.success('Work order closed and finalized');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cancelMutation.mutateAsync(cancelReason || undefined);
      setCancelOpen(false);
      toast.success('Work order cancelled');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(workOrder.status === 'OPEN' || workOrder.status === 'ASSIGNED') && (
        <Button
          size="sm"
          onClick={handleStartWork}
          disabled={updateStatusMutation.isPending}
        >
          <Play className="mr-1.5 h-3.5 w-3.5" />
          Start Work
        </Button>
      )}

      {workOrder.status === 'IN_PROGRESS' && (
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setResolveOpen(true)}
        >
          <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
          Resolve Work Order
        </Button>
      )}

      {workOrder.status === 'RESOLVED' && isManagerOrAdmin && (
        <>
          <Button
            size="sm"
            onClick={handleClose}
            disabled={closeMutation.isPending}
          >
            <Archive className="mr-1.5 h-3.5 w-3.5" />
            Close Order
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReopenOpen(true)}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reopen
          </Button>
        </>
      )}

      {isManagerOrAdmin && workOrder.status !== 'CLOSED' && workOrder.status !== 'CANCELLED' && (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setCancelOpen(true)}
        >
          <Ban className="mr-1.5 h-3.5 w-3.5" />
          Cancel
        </Button>
      )}

      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Work Order</DialogTitle>
            <DialogDescription>
              Summarize the actions taken to repair or resolve this maintenance incident.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResolveSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="resolutionSummary">Resolution Summary</Label>
              <Textarea
                id="resolutionSummary"
                placeholder="Replaced faulty valve and pressure tested lines to 60 PSI..."
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResolveOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={resolveMutation.isPending}>
                Confirm Resolution
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={reopenOpen} onOpenChange={setReopenOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reopen Work Order</DialogTitle>
            <DialogDescription>
              State the reason why this issue requires further maintenance attention.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReopenSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="reopenReason">Reopen Reason</Label>
              <Textarea
                id="reopenReason"
                placeholder="Leak reappeared after system repressurization..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReopenOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={reopenMutation.isPending}>
                Reopen Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Work Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this work order? This action cannot be easily undone.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCancelSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cancelReason">Cancellation Reason (Optional)</Label>
              <Textarea
                id="cancelReason"
                placeholder="Duplicate entry or issue no longer applicable..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>
                Go Back
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={cancelMutation.isPending}
              >
                Cancel Work Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
