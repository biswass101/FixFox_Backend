'use client';

import { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCw,
  Check,
  Edit2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  WorkOrderAIAnalysis,
  WorkOrderCategory,
  WorkOrderPriority,
} from '@/types/work-orders';
import {
  useReviewAITriageMutation,
  useRetryAITriageMutation,
} from '@/hooks/use-work-orders';
import { useAuthStore } from '@/stores/auth.store';
import { formatApiError } from '@/lib/api-errors';

interface AITriagePanelProps {
  workOrderId: string;
  aiAnalysis?: WorkOrderAIAnalysis | null;
}

const statusBadgeConfig = {
  PENDING: { label: 'Triage Queued', variant: 'secondary' as const, icon: Clock },
  PROCESSING: { label: 'Analyzing', variant: 'secondary' as const, icon: RotateCw },
  COMPLETED: { label: 'Ready for Review', variant: 'info' as const, icon: Sparkles },
  REVIEWED: { label: 'Verified & Applied', variant: 'success' as const, icon: CheckCircle2 },
  FAILED: { label: 'Analysis Failed', variant: 'destructive' as const, icon: XCircle },
};

const categoryOptions: WorkOrderCategory[] = [
  'PLUMBING',
  'ELECTRICAL',
  'HVAC',
  'STRUCTURAL',
  'CLEANING',
  'SAFETY',
  'EQUIPMENT',
  'FURNITURE',
  'IT_NETWORK',
  'PEST_CONTROL',
  'LANDSCAPING',
  'ELEVATOR',
  'FIRE_SAFETY',
  'GENERAL',
  'OTHER',
];

const priorityOptions: WorkOrderPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function AITriagePanel({ workOrderId, aiAnalysis }: AITriagePanelProps) {
  const { user } = useAuthStore();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WorkOrderCategory>(
    aiAnalysis?.suggestedCategory || 'GENERAL'
  );
  const [selectedPriority, setSelectedPriority] = useState<WorkOrderPriority>(
    aiAnalysis?.suggestedPriority || 'MEDIUM'
  );
  const [overrideReason, setOverrideReason] = useState('');

  const reviewMutation = useReviewAITriageMutation(workOrderId);
  const retryMutation = useRetryAITriageMutation(workOrderId);

  if (!aiAnalysis) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">AI Triage Analysis</CardTitle>
          </div>
          <CardDescription>Automated priority, category, and hazard evaluation</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground py-6 text-center">
          No automated analysis requested or queued for this work order.
        </CardContent>
      </Card>
    );
  }

  const statusConfig = statusBadgeConfig[aiAnalysis.status] || {
    label: aiAnalysis.status,
    variant: 'secondary' as const,
    icon: Clock,
  };
  const StatusIcon = statusConfig.icon;

  const safetyFlags: string[] = Array.isArray(aiAnalysis.safetyFlags)
    ? (aiAnalysis.safetyFlags as string[])
    : [];

  const handleAccept = async () => {
    try {
      await reviewMutation.mutateAsync({ accepted: true });
      toast.success('AI recommendations accepted and applied to work order');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      toast.error('Please specify an override rationale');
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        accepted: false,
        overrideReason,
        finalCategory: selectedCategory,
        finalPriority: selectedPriority,
      });
      setIsOverrideOpen(false);
      toast.success('Work order updated with overridden classification');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleRetry = async () => {
    try {
      await retryMutation.mutateAsync();
      toast.success('AI analysis job requeued for execution');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">AI Triage Assessment</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Automated classification powered by {aiAnalysis.model || 'OpenRouter LLM'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {safetyFlags.length > 0 && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-800 dark:text-red-300"
          >
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-red-900 dark:text-red-200">
              <ShieldAlert className="h-4 w-4" />
              Safety Flags Identified
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {safetyFlags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {aiAnalysis.summary && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Incident Summary
            </p>
            <p className="text-sm text-foreground bg-muted/40 p-3 rounded-md leading-relaxed">
              {aiAnalysis.summary}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
          <div className="rounded-md border p-3 bg-muted/20">
            <span className="text-xs text-muted-foreground block mb-1">
              Suggested Category
            </span>
            {aiAnalysis.suggestedCategory ? (
              <span className="font-semibold text-sm">
                {aiAnalysis.suggestedCategory.replace('_', ' ')}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">None</span>
            )}
          </div>

          <div className="rounded-md border p-3 bg-muted/20">
            <span className="text-xs text-muted-foreground block mb-1">
              Suggested Priority
            </span>
            {aiAnalysis.suggestedPriority ? (
              <PriorityBadge priority={aiAnalysis.suggestedPriority} />
            ) : (
              <span className="text-sm text-muted-foreground">None</span>
            )}
          </div>
        </div>

        {aiAnalysis.rationale && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Triage Rationale
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {aiAnalysis.rationale}
            </p>
          </div>
        )}

        {aiAnalysis.status === 'REVIEWED' && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              {aiAnalysis.accepted ? 'Accepted by Manager' : 'Overridden by Manager'}
            </div>
            {aiAnalysis.overrideReason && (
              <p className="mt-1 text-xs opacity-90">
                Override reason: {aiAnalysis.overrideReason}
              </p>
            )}
          </div>
        )}

        {aiAnalysis.status === 'FAILED' && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center justify-between">
            <div>
              <p className="font-semibold">Analysis failed</p>
              <p className="text-xs opacity-90">{aiAnalysis.errorMessage || 'Unknown AI error'}</p>
            </div>
            {isManagerOrAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={retryMutation.isPending}
              >
                <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                Retry
              </Button>
            )}
          </div>
        )}

        {isManagerOrAdmin && aiAnalysis.status === 'COMPLETED' && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              size="sm"
              onClick={handleAccept}
              disabled={reviewMutation.isPending}
              className="flex-1"
            >
              <Check className="mr-1.5 h-4 w-4" />
              Accept Suggestions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOverrideOpen(true)}
              disabled={reviewMutation.isPending}
            >
              <Edit2 className="mr-1.5 h-3.5 w-3.5" />
              Override
            </Button>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground italic text-center">
          AI triage recommendations are decision-support suggestions and require human judgment.
        </p>
      </CardContent>

      <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override AI Recommendations</DialogTitle>
            <DialogDescription>
              Select your authoritative classification and provide an audit reason for the override.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOverrideSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Final Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val as WorkOrderCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">Final Priority</Label>
              <Select
                value={selectedPriority}
                onValueChange={(val) => setSelectedPriority(val as WorkOrderPriority)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((pri) => (
                    <SelectItem key={pri} value={pri}>
                      {pri}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Override Rationale</Label>
              <Textarea
                id="reason"
                placeholder="Explain why the AI classification was adjusted..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOverrideOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={reviewMutation.isPending}>
                Save & Apply Override
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

