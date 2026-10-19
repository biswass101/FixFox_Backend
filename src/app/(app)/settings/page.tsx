'use client';

import { useState } from 'react';
import {
  User as UserIcon,
  Building,
  Mail,
  Shield,
  KeyRound,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/stores/auth.store';
import {
  useInvitations,
  useCreateInvitationMutation,
  useRevokeInvitationMutation,
} from '@/hooks/use-entities';
import { authApi } from '@/lib/api/auth.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/types/auth';
import { formatDateTime } from '@/lib/utils';
import { formatApiError } from '@/lib/api-errors';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'team' | 'security'>(
    'profile'
  );

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('TECHNICIAN');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const { data: invitations = [], isLoading: isInvitesLoading } = useInvitations();
  const createInviteMutation = useCreateInvitationMutation();
  const revokeInviteMutation = useRevokeInvitationMutation();

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      await createInviteMutation.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setIsInviteOpen(false);
      setInviteEmail('');
      toast.success('Invitation dispatched successfully');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    try {
      await revokeInviteMutation.mutateAsync(id);
      toast.success('Invitation revoked');
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(formatApiError(err).message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Workspace Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal credentials, facility organization, and staff invitations
        </p>
      </div>

      <div className="flex border-b space-x-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'profile'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('organization')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'organization'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Organization
        </button>
        {isManagerOrAdmin && (
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'team'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Team Invitations
          </button>
        )}
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'security'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Security
        </button>
      </div>

      {activeTab === 'profile' && (
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">User Profile</CardTitle>
            </div>
            <CardDescription>Your personal profile details and assigned platform permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={user?.fullName || ''} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input value={user?.email || ''} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-1.5">
                <Label>Platform Role</Label>
                <div>
                  <Badge variant="outline" className="text-xs px-2.5 py-1">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              {user?.phone && (
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input value={user.phone} disabled className="bg-muted/50" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'organization' && (
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Organization Workspace</CardTitle>
            </div>
            <CardDescription>Your active corporate maintenance tenant and accounting currency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Organization Name</Label>
                <Input value={user?.organization?.name || ''} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-1.5">
                <Label>Organization Slug</Label>
                <Input value={user?.organization?.slug || ''} disabled className="bg-muted/50 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>Accounting Currency</Label>
                <Input value={user?.organization?.defaultCurrency || 'BDT'} disabled className="bg-muted/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'team' && isManagerOrAdmin && (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">Team Invitations</CardTitle>
              </div>
              <CardDescription>Invite managers, technicians, and reporters to your workspace</CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsInviteOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Invite Member
            </Button>
          </CardHeader>
          <CardContent>
            {isInvitesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : invitations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6 italic">
                No active or pending team invitations.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium text-xs">{inv.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {inv.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            inv.status === 'ACCEPTED'
                              ? 'success'
                              : inv.status === 'PENDING'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(inv.expiresAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {inv.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive hover:bg-destructive/10"
                            onClick={() => handleRevokeInvite(inv.id)}
                            disabled={revokeInviteMutation.isPending}
                          >
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Team Invitation</DialogTitle>
                <DialogDescription>
                  Enter the email address and assign an authorized role.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendInvite} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="invEmail">Recipient Email</Label>
                  <Input
                    id="invEmail"
                    type="email"
                    placeholder="technician@organization.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invRole">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(val) => setInviteRole(val as UserRole)}
                  >
                    <SelectTrigger id="invRole">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {isAdmin && <SelectItem value="ADMIN">ADMIN</SelectItem>}
                      <SelectItem value="MANAGER">MANAGER</SelectItem>
                      <SelectItem value="TECHNICIAN">TECHNICIAN</SelectItem>
                      <SelectItem value="REPORTER">REPORTER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createInviteMutation.isPending}>
                    {createInviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Change Password</CardTitle>
            </div>
            <CardDescription>Update your credentials to safeguard account security</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label htmlFor="curPass">Current Password</Label>
                <Input
                  id="curPass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPass">New Password (min 8 chars)</Label>
                <Input
                  id="newPass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confPass">Confirm New Password</Label>
                <Input
                  id="confPass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
