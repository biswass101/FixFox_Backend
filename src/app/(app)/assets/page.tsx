'use client';

import { useState } from 'react';
import { Box, Plus, Edit2, Trash2, Search, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

import {
  useAssets,
  useLocations,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} from '@/hooks/use-entities';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Asset, AssetCondition } from '@/types/entities';
import { formatApiError } from '@/lib/api-errors';

const conditionBadgeStyles: Record<AssetCondition, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
  EXCELLENT: { label: 'Excellent', variant: 'success' },
  GOOD: { label: 'Good', variant: 'success' },
  FAIR: { label: 'Fair', variant: 'warning' },
  POOR: { label: 'Poor', variant: 'destructive' },
  OUT_OF_SERVICE: { label: 'Out of Service', variant: 'destructive' },
};

export default function AssetsPage() {
  const { user } = useAuthStore();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

  const [locationId, setLocationId] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('GOOD');
  const [manufacturer, setManufacturer] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  const { data: locationsData } = useLocations({ isActive: true });
  const { data: assetsData, isLoading, isError, refetch, isRefetching } = useAssets({
    search: search.trim() || undefined,
  });

  const createMutation = useCreateAssetMutation();
  const updateMutation = useUpdateAssetMutation(editingAsset?.id || '');
  const deleteMutation = useDeleteAssetMutation();

  const locations = locationsData?.data || [];
  const assets = assetsData?.data || [];

  const handleOpenCreate = () => {
    setLocationId(locations[0]?.id || '');
    setAssetCode('');
    setName('');
    setCategory('HVAC');
    setCondition('GOOD');
    setManufacturer('');
    setModelNumber('');
    setSerialNumber('');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setLocationId(asset.locationId);
    setAssetCode(asset.assetCode);
    setName(asset.name);
    setCategory(asset.category);
    setCondition(asset.condition);
    setManufacturer(asset.manufacturer || '');
    setModelNumber(asset.modelNumber || '');
    setSerialNumber(asset.serialNumber || '');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId || !assetCode.trim() || !name.trim()) return;

    try {
      await createMutation.mutateAsync({
        locationId,
        assetCode: assetCode.trim().toUpperCase(),
        name: name.trim(),
        category: category.trim() || 'General Equipment',
        condition,
        manufacturer: manufacturer.trim() || undefined,
        modelNumber: modelNumber.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
      });
      setIsCreateOpen(false);
      toast.success('Asset created');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !name.trim()) return;

    try {
      await updateMutation.mutateAsync({
        locationId: locationId || undefined,
        name: name.trim(),
        category: category.trim() || undefined,
        condition,
        manufacturer: manufacturer.trim() || undefined,
        modelNumber: modelNumber.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
      });
      setEditingAsset(null);
      toast.success('Asset updated');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAssetId) return;

    try {
      await deleteMutation.mutateAsync(deletingAssetId);
      setDeletingAssetId(null);
      toast.success('Asset deleted');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipment & Assets</h2>
          <p className="text-sm text-muted-foreground">
            Inventory of facility machinery, electrical equipment, and physical assets
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

          {isManagerOrAdmin && (
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              Register Asset
            </Button>
          )}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, asset code, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Failed to load assets. Please refresh.
        </div>
      )}

      {isLoading ? (
        <div className="border rounded-lg p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={Box}
          title="No assets registered"
          description="Register equipment and physical assets to track maintenance costs and condition."
          action={
            isManagerOrAdmin
              ? {
                  label: 'Register asset',
                  onClick: handleOpenCreate,
                }
              : undefined
          }
        />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Code</TableHead>
                  <TableHead>Equipment Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Model / Mfr</TableHead>
                  {isManagerOrAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => {
                  const badge = conditionBadgeStyles[asset.condition] || {
                    label: asset.condition,
                    variant: 'secondary' as const,
                  };

                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        {asset.assetCode}
                      </TableCell>
                      <TableCell className="font-medium text-foreground text-sm">
                        {asset.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {asset.category}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {asset.location?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} className="text-[10px]">
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {asset.modelNumber || asset.manufacturer
                          ? `${asset.manufacturer || ''} ${asset.modelNumber || ''}`
                          : '—'}
                      </TableCell>
                      {isManagerOrAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEdit(asset)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => setDeletingAssetId(asset.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Equipment Asset</DialogTitle>
            <DialogDescription>
              Add a new machinery or physical asset to your facility inventory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="assetCode">Asset Code</Label>
                <Input
                  id="assetCode"
                  placeholder="e.g. HVAC-004"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Facility Location</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assetName">Asset Name</Label>
              <Input
                id="assetName"
                placeholder="Rooftop Chiller Unit #2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="HVAC / Plumbing / Generator"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="condition">Physical Condition</Label>
                <Select
                  value={condition}
                  onValueChange={(val) => setCondition(val as AssetCondition)}
                >
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCELLENT">Excellent</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="FAIR">Fair</SelectItem>
                    <SelectItem value="POOR">Poor</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  placeholder="Carrier"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">Model Number</Label>
                <Input
                  id="model"
                  placeholder="30XA-080"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serial">Serial Number</Label>
                <Input
                  id="serial"
                  placeholder="SN-98214"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Save Asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingAsset)} onOpenChange={(open) => !open && setEditingAsset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Equipment Asset</DialogTitle>
            <DialogDescription>Update asset condition and metadata.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editName">Asset Name</Label>
              <Input
                id="editName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="editCat">Category</Label>
                <Input
                  id="editCat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editCond">Physical Condition</Label>
                <Select
                  value={condition}
                  onValueChange={(val) => setCondition(val as AssetCondition)}
                >
                  <SelectTrigger id="editCond">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXCELLENT">Excellent</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="FAIR">Fair</SelectItem>
                    <SelectItem value="POOR">Poor</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="editMfr">Manufacturer</Label>
                <Input
                  id="editMfr"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editModel">Model</Label>
                <Input
                  id="editModel"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editSerial">Serial Number</Label>
                <Input
                  id="editSerial"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingAsset(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingAssetId)}
        onOpenChange={(open) => !open && setDeletingAssetId(null)}
        title="Delete Equipment Asset"
        description="Are you sure you want to delete this asset from the registry? Historical work orders will maintain their records."
        variant="destructive"
        confirmLabel="Delete Asset"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

