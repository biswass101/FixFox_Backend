'use client';

import { useState } from 'react';
import { DollarSign, Plus, Trash2, Wrench, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { WorkOrderCost } from '@/types/work-orders';
import { useCreateCostMutation, useDeleteCostMutation } from '@/hooks/use-work-orders';
import { formatCurrency } from '@/lib/utils';
import { formatApiError } from '@/lib/api-errors';

interface WorkCostsSectionProps {
  workOrderId: string;
  costs: WorkOrderCost[];
  currency?: string;
  canEdit?: boolean;
}

export function WorkCostsSection({
  workOrderId,
  costs,
  currency = 'BDT',
  canEdit = true,
}: WorkCostsSectionProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [type, setType] = useState<'PARTS' | 'LABOR'>('PARTS');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState('');
  const [laborHours, setLaborHours] = useState('');

  const createCostMutation = useCreateCostMutation(workOrderId);
  const deleteCostMutation = useDeleteCostMutation(workOrderId);

  const totalCostSum = costs.reduce((acc, item) => acc + Number(item.totalCost || 0), 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const unit = parseFloat(unitCost);
    const hours = laborHours ? parseFloat(laborHours) : undefined;

    if (!description.trim() || isNaN(qty) || qty <= 0 || isNaN(unit) || unit < 0) {
      toast.error('Please enter valid cost item values');
      return;
    }

    try {
      await createCostMutation.mutateAsync({
        type,
        description: description.trim(),
        quantity: qty,
        unitCost: unit,
        laborHours: hours,
        currency,
      });
      setIsAddOpen(false);
      setDescription('');
      setQuantity('1');
      setUnitCost('');
      setLaborHours('');
      toast.success('Cost entry recorded');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleDelete = async (costId: string) => {
    try {
      await deleteCostMutation.mutateAsync(costId);
      toast.success('Cost entry removed');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Parts & Labor Costs</CardTitle>
          </div>
          <CardDescription>Itemized material expenses and technician billing hours</CardDescription>
        </div>
        {canEdit && (
          <Button size="sm" variant="outline" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Cost
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {costs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 italic">
            No parts or labor costs logged for this work order.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {canEdit && <TableHead className="w-10"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell>
                      <Badge
                        variant={cost.type === 'LABOR' ? 'info' : 'secondary'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {cost.type === 'LABOR' ? (
                          <Clock className="mr-1 h-3 w-3 inline" />
                        ) : (
                          <Wrench className="mr-1 h-3 w-3 inline" />
                        )}
                        {cost.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-xs">{cost.description}</TableCell>
                    <TableCell className="text-right text-xs">{cost.quantity}</TableCell>
                    <TableCell className="text-right text-xs">
                      {formatCurrency(cost.unitCost, cost.currency)}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {cost.laborHours ? `${cost.laborHours}h` : '—'}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs">
                      {formatCurrency(cost.totalCost, cost.currency)}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(cost.id)}
                          disabled={deleteCostMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex justify-between items-center border-t pt-3">
          <span className="text-sm font-semibold">Total Work Order Spend</span>
          <span className="text-base font-bold text-foreground">
            {formatCurrency(totalCostSum, currency)}
          </span>
        </div>
      </CardContent>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Cost Entry</DialogTitle>
            <DialogDescription>
              Record replacement parts or billable labor hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="costType">Cost Type</Label>
              <Select
                value={type}
                onValueChange={(val) => setType(val as 'PARTS' | 'LABOR')}
              >
                <SelectTrigger id="costType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PARTS">Parts / Materials</SelectItem>
                  <SelectItem value="LABOR">Labor Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="costDesc">Description</Label>
              <Input
                id="costDesc"
                placeholder={type === 'PARTS' ? 'Brass ball valve 3/4 inch' : 'Standard piping repair labor'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unitCost">Unit Cost ({currency})</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  required
                />
              </div>
            </div>

            {type === 'LABOR' && (
              <div className="space-y-1.5">
                <Label htmlFor="laborHours">Labor Hours</Label>
                <Input
                  id="laborHours"
                  type="number"
                  step="0.25"
                  min="0.1"
                  placeholder="e.g. 2.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(e.target.value)}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCostMutation.isPending}>
                Save Cost Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

