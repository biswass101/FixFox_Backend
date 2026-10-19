'use client';

import { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Building, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

import {
  useLocations,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} from '@/hooks/use-entities';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Location } from '@/types/entities';
import { formatApiError, showErrorToast } from '@/lib/api-errors';

export default function LocationsPage() {
  const { user } = useAuthStore();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useLocations();
  const createMutation = useCreateLocationMutation();
  const updateMutation = useUpdateLocationMutation(editingLocation?.id || '');
  const deleteMutation = useDeleteLocationMutation();

  const locations = data?.data || [];

  const handleOpenCreate = () => {
    setName('');
    setBuilding('');
    setFloor('');
    setRoom('');
    setDescription('');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (loc: Location) => {
    setEditingLocation(loc);
    setName(loc.name);
    setBuilding(loc.building || '');
    setFloor(loc.floor || '');
    setRoom(loc.room || '');
    setDescription(loc.description || '');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Location name required', {
        description: 'Please enter a name for this location',
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        building: building.trim() || undefined,
        floor: floor.trim() || undefined,
        room: room.trim() || undefined,
        description: description.trim() || undefined,
      });
      setIsCreateOpen(false);
      toast.success('Location created');
    } catch (err) {
      showErrorToast(err, 'Failed to create location');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    if (!name.trim()) {
      toast.error('Location name required', {
        description: 'Location name cannot be blank',
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        building: building.trim() || undefined,
        floor: floor.trim() || undefined,
        room: room.trim() || undefined,
        description: description.trim() || undefined,
      });
      setEditingLocation(null);
      toast.success('Location updated');
    } catch (err) {
      showErrorToast(err, 'Failed to update location');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLocationId) return;

    try {
      await deleteMutation.mutateAsync(deletingLocationId);
      setDeletingLocationId(null);
      toast.success('Location deleted');
    } catch (err) {
      showErrorToast(err, 'Failed to delete location');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Facility Locations</h2>
          <p className="text-sm text-muted-foreground">
            Manage buildings, wings, floors, and rooms for maintenance routing
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
              Add Location
            </Button>
          )}
        </div>
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Failed to load locations. Please refresh.
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
      ) : locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No locations configured"
          description="Add your first building, floor, or zone to begin assigning work orders."
          action={
            isManagerOrAdmin
              ? {
                  label: 'Add location',
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
                  <TableHead>Location Name</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Floor / Room</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  {isManagerOrAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        {loc.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {loc.building || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {loc.floor || loc.room
                        ? `${loc.floor ? `Floor ${loc.floor}` : ''} ${loc.room ? `Room ${loc.room}` : ''}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {loc.description || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={loc.isActive ? 'success' : 'secondary'} className="text-[11px]">
                        {loc.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {isManagerOrAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(loc)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeletingLocationId(loc.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Facility Location</DialogTitle>
            <DialogDescription>
              Define a new physical area within your organization facilities.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="locName">Location Name</Label>
              <Input
                id="locName"
                placeholder="e.g. West Wing Mechanical Room"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="building">Building</Label>
                <Input
                  id="building"
                  placeholder="Main Tower"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  placeholder="B1 / 3"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  placeholder="104"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description (Optional)</Label>
              <Textarea
                id="desc"
                placeholder="Access key card required at entrance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Create Location
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingLocation)} onOpenChange={(open) => !open && setEditingLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>Update facility location details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editName">Location Name</Label>
              <Input
                id="editName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="editBuilding">Building</Label>
                <Input
                  id="editBuilding"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editFloor">Floor</Label>
                <Input
                  id="editFloor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editRoom">Room</Label>
                <Input
                  id="editRoom"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editDesc">Description</Label>
              <Textarea
                id="editDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingLocation(null)}>
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
        open={Boolean(deletingLocationId)}
        onOpenChange={(open) => !open && setDeletingLocationId(null)}
        title="Delete Location"
        description="Are you sure you want to delete this facility location? Any work orders referencing this location will retain their history."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

