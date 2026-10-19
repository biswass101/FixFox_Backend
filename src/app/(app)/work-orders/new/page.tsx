'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Loader2, Sparkles, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  useCreateWorkOrderMutation,
  useUploadImageMutation,
} from '@/hooks/use-work-orders';
import { useLocations, useAssets } from '@/hooks/use-entities';
import {
  WorkOrderCategory,
  WorkOrderPriority,
} from '@/types/work-orders';
import { formatApiError } from '@/lib/api-errors';

const createSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters'),
  locationId: z.string().min(1, 'Please select a facility location'),
  assetId: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;

const categoryOptions: WorkOrderCategory[] = [
  'GENERAL',
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
  'OTHER',
];

const priorityOptions: WorkOrderPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const { data: locationsData, isLoading: isLocLoading } = useLocations({ isActive: true });
  const { data: assetsData, isLoading: isAssetsLoading } = useAssets({
    locationId: selectedLocationId || undefined,
    isActive: true,
  });

  const createMutation = useCreateWorkOrderMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: '',
      description: '',
      locationId: '',
      assetId: '',
      category: 'GENERAL',
      priority: 'MEDIUM',
    },
  });

  const watchLocation = watch('locationId');

  const onSubmit = async (values: CreateFormData) => {
    try {
      const workOrder = await createMutation.mutateAsync({
        title: values.title,
        description: values.description,
        locationId: values.locationId,
        assetId: values.assetId && values.assetId !== 'NONE' ? values.assetId : undefined,
        category: values.category as WorkOrderCategory,
        priority: values.priority as WorkOrderPriority,
      });

      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('image', selectedFile);
          const { apiClient } = await import('@/lib/axios');
          await apiClient.post(`/work-orders/${workOrder.id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch {
          toast.warning('Work order created, but initial photo upload failed. You can re-upload on the details page.');
        }
      }

      toast.success('Work order created! AI triage dispatched.');
      router.push(`/work-orders/${workOrder.id}`);
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const locations = locationsData?.data || [];
  const assets = assetsData?.data || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/work-orders" className="flex items-center gap-1 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back to Work Orders
          </Link>
        </Button>
      </div>

      <Card className="border-border/60 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight">
            Log New Work Order
          </CardTitle>
          <CardDescription>
            Report a facility maintenance incident. FixFlow AI will automatically analyze urgency, hazard flags, and categorization.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                placeholder="e.g. Main water riser leaking on 3rd floor"
                aria-invalid={!!errors.title}
                disabled={createMutation.isPending}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Detailed Description</Label>
                <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
                  <Sparkles className="h-3 w-3" /> AI Assisted
                </span>
              </div>
              <Textarea
                id="description"
                placeholder="Describe what occurred, any strange noises, water flow, or physical damage. Feel free to describe in plain English without guessing technical terminology."
                className="min-h-[120px]"
                aria-invalid={!!errors.description}
                disabled={createMutation.isPending}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location">Facility Location</Label>
                <Select
                  value={watchLocation}
                  onValueChange={(val) => {
                    setValue('locationId', val);
                    setSelectedLocationId(val);
                    setValue('assetId', '');
                  }}
                  disabled={isLocLoading || createMutation.isPending}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder={isLocLoading ? 'Loading locations...' : 'Select location'} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name} {loc.building ? `(${loc.building})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.locationId && (
                  <p className="text-xs text-destructive">{errors.locationId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asset">Associated Asset / Equipment (Optional)</Label>
                <Select
                  value={watch('assetId') || 'NONE'}
                  onValueChange={(val) => setValue('assetId', val === 'NONE' ? '' : val)}
                  disabled={!selectedLocationId || isAssetsLoading || createMutation.isPending}
                >
                  <SelectTrigger id="asset">
                    <SelectValue
                      placeholder={
                        !selectedLocationId
                          ? 'Select a location first'
                          : isAssetsLoading
                          ? 'Loading assets...'
                          : 'Select asset'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No specific asset</SelectItem>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.assetCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category (Manual Override)</Label>
                <Select
                  value={watch('category') || 'GENERAL'}
                  onValueChange={(val) => setValue('category', val)}
                  disabled={createMutation.isPending}
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
                <Label htmlFor="priority">Initial Priority</Label>
                <Select
                  value={watch('priority') || 'MEDIUM'}
                  onValueChange={(val) => setValue('priority', val)}
                  disabled={createMutation.isPending}
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
            </div>

            <div className="space-y-1.5 pt-1">
              <Label htmlFor="attachment">Evidence Photo (Optional)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="attachment"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={createMutation.isPending}
                  className="cursor-pointer file:cursor-pointer"
                />
              </div>
            </div>
          </CardContent>

          <div className="flex items-center justify-end gap-3 p-6 pt-0 border-t">
            <Button asChild variant="outline" type="button">
              <Link href="/work-orders">Cancel</Link>
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Order...
                </>
              ) : (
                'Create Work Order'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

