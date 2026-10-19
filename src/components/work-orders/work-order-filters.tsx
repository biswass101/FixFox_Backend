'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderCategory,
} from '@/types/work-orders';

interface WorkOrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status?: WorkOrderStatus;
  onStatusChange: (value: WorkOrderStatus | undefined) => void;
  priority?: WorkOrderPriority;
  onPriorityChange: (value: WorkOrderPriority | undefined) => void;
  category?: WorkOrderCategory;
  onCategoryChange: (value: WorkOrderCategory | undefined) => void;
  onReset: () => void;
}

const statusOptions: { label: string; value: WorkOrderStatus }[] = [
  { label: 'Open', value: 'OPEN' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const priorityOptions: { label: string; value: WorkOrderPriority }[] = [
  { label: 'Critical', value: 'CRITICAL' },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

const categoryOptions: { label: string; value: WorkOrderCategory }[] = [
  { label: 'Plumbing', value: 'PLUMBING' },
  { label: 'Electrical', value: 'ELECTRICAL' },
  { label: 'HVAC', value: 'HVAC' },
  { label: 'Structural', value: 'STRUCTURAL' },
  { label: 'Cleaning', value: 'CLEANING' },
  { label: 'Safety', value: 'SAFETY' },
  { label: 'Equipment', value: 'EQUIPMENT' },
  { label: 'Furniture', value: 'FURNITURE' },
  { label: 'IT & Network', value: 'IT_NETWORK' },
  { label: 'General', value: 'GENERAL' },
  { label: 'Other', value: 'OTHER' },
];

export function WorkOrderFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  onReset,
}: WorkOrderFiltersProps) {
  const hasActiveFilters = Boolean(search || status || priority || category);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search work orders..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={status || 'ALL'}
          onValueChange={(val) => onStatusChange(val === 'ALL' ? undefined : (val as WorkOrderStatus))}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priority || 'ALL'}
          onValueChange={(val) =>
            onPriorityChange(val === 'ALL' ? undefined : (val as WorkOrderPriority))
          }
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priorities</SelectItem>
            {priorityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={category || 'ALL'}
          onValueChange={(val) =>
            onCategoryChange(val === 'ALL' ? undefined : (val as WorkOrderCategory))
          }
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

