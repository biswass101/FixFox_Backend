'use client';

import { useState } from 'react';
import { MessageSquare, Lock, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { WorkNote } from '@/types/work-orders';
import { useCreateNoteMutation } from '@/hooks/use-work-orders';
import { formatRelativeTime } from '@/lib/utils';
import { formatApiError } from '@/lib/api-errors';

interface WorkNotesSectionProps {
  workOrderId: string;
  notes: WorkNote[];
}

export function WorkNotesSection({ workOrderId, notes }: WorkNotesSectionProps) {
  const [body, setBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const createNoteMutation = useCreateNoteMutation(workOrderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      await createNoteMutation.mutateAsync({
        body: body.trim(),
        isInternal,
      });
      setBody('');
      setIsInternal(false);
      toast.success('Work note added');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">Work Notes & Logs</CardTitle>
        </div>
        <CardDescription>
          Field logs, diagnostic observations, and internal updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Log technical progress or internal observation..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={createNoteMutation.isPending}
            className="min-h-[80px]"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center space-x-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="flex items-center gap-1 font-medium">
                <Lock className="h-3 w-3" />
                Internal Note (Staff only)
              </span>
            </label>

            <Button
              type="submit"
              size="sm"
              disabled={createNoteMutation.isPending || !body.trim()}
              className="flex items-center gap-1.5"
            >
              {createNoteMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="pt-2 space-y-3">
          {notes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4 italic">
              No notes logged on this work order yet.
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`rounded-lg border p-3.5 text-sm space-y-2 ${
                  note.isInternal ? 'bg-amber-500/5 border-amber-500/20' : 'bg-card'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {note.author?.fullName || 'Technician'}
                    </span>
                    {note.isInternal && (
                      <Badge variant="warning" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" />
                        Internal
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {formatRelativeTime(note.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {note.body}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

