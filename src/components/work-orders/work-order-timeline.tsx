import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { WorkOrderStatusHistory } from '@/types/work-orders';
import { formatDateTime } from '@/lib/utils';

interface WorkOrderTimelineProps {
  history: WorkOrderStatusHistory[];
}

export function WorkOrderTimeline({ history }: WorkOrderTimelineProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">Activity & Status History</CardTitle>
        </div>
        <CardDescription>Chronological audit log of state transitions</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 italic">
            No status changes logged yet.
          </p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:top-2 before:left-2 before:w-[2px] before:bg-muted">
            {history.map((entry) => (
              <div key={entry.id} className="relative">
                <div className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <StatusBadge status={entry.newStatus} />
                    <span className="text-muted-foreground">by</span>
                    <span className="font-semibold text-foreground">
                      {entry.changedBy?.fullName || 'System'}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
                  </div>
                  {entry.reason && (
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded mt-1">
                      Reason: {entry.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

