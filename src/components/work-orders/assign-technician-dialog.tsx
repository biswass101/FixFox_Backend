'use client';

import { useState } from 'react';
import { UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useTechnicians } from '@/hooks/use-entities';
import { useAssignTechnicianMutation } from '@/hooks/use-work-orders';
import { formatApiError } from '@/lib/api-errors';

interface AssignTechnicianDialogProps {
  workOrderId: string;
  currentAssigneeId?: string | null;
}

export function AssignTechnicianDialog({
  workOrderId,
  currentAssigneeId,
}: AssignTechnicianDialogProps) {
  const [open, setOpen] = useState(false);
  const [technicianId, setTechnicianId] = useState(currentAssigneeId || '');
  const [reason, setReason] = useState('');

  const { data: technicians = [], isLoading: isTechLoading } = useTechnicians();
  const assignMutation = useAssignTechnicianMutation(workOrderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technicianId) {
      toast.error('Please select a technician');
      return;
    }

    try {
      await assignMutation.mutateAsync({
        technicianId,
        reason: reason.trim() || undefined,
      });
      setOpen(false);
      toast.success('Technician assigned successfully');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <UserCheck className="h-4 w-4" />
          {currentAssigneeId ? 'Reassign' : 'Assign Technician'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Work Order</DialogTitle>
          <DialogDescription>
            Assign an active technician to take responsibility for this job.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="technician">Select Technician</Label>
            {isTechLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading technicians...
              </div>
            ) : technicians.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No active technicians found in this organization.
              </p>
            ) : (
              <Select value={technicianId} onValueChange={setTechnicianId}>
                <SelectTrigger id="technician">
                  <SelectValue placeholder="Choose technician..." />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      <span className="font-medium">{tech.fullName}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        ({tech.activeJobCount} active {tech.activeJobCount === 1 ? 'job' : 'jobs'})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assignReason">Assignment Note / Reason (Optional)</Label>
            <Textarea
              id="assignReason"
              placeholder="Primary plumber on duty for Building A..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={assignMutation.isPending || !technicianId}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Technician'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

