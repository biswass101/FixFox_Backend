'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Building, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { invitationsApi, VerifyInvitationResponse } from '@/lib/api/invitations.api';
import { formatApiError, showErrorToast } from '@/lib/api-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

const acceptSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type AcceptFormData = z.infer<typeof acceptSchema>;

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<VerifyInvitationResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptFormData>({
    resolver: zodResolver(acceptSchema),
    defaultValues: {
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!token) {
      setVerifyError('Invitation token missing from URL. Please check your invitation link.');
      setIsVerifying(false);
      return;
    }

    invitationsApi
      .verify(token)
      .then((data) => {
        setInviteDetails(data);
        setIsVerifying(false);
      })
      .catch((err) => {
        setVerifyError(formatApiError(err).message || 'Invalid or expired invitation token');
        setIsVerifying(false);
      });
  }, [token]);

  const onSubmit = async (values: AcceptFormData) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      await invitationsApi.accept({
        token,
        fullName: values.fullName,
        password: values.password,
      });
      toast.success('Invitation accepted! Please sign in with your new account.');
      router.replace('/login');
    } catch (err) {
      showErrorToast(err, 'Failed to accept invitation');
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <Card className="p-8">
        <LoadingSpinner size="md" label="Verifying invitation..." />
      </Card>
    );
  }

  if (verifyError || !inviteDetails) {
    return (
      <Card className="border-border/60 shadow-lg text-center">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight text-destructive">
            Invalid Invitation
          </CardTitle>
          <CardDescription>
            {verifyError || 'This invitation has expired or has already been accepted.'}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/login">Return to Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">
          Join {inviteDetails.organizationName}
        </CardTitle>
        <CardDescription>
          You have been invited to join the maintenance team as a{' '}
          <Badge variant="outline" className="text-xs">
            {inviteDetails.role}
          </Badge>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-1 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>{inviteDetails.email}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <Building className="h-3.5 w-3.5" />
              <span>Workspace: {inviteDetails.organizationName}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Your full name"
              disabled={isSubmitting}
              aria-invalid={!!errors.fullName}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Create Password (min 8 characters)</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={isSubmitting}
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining organization...
              </>
            ) : (
              'Accept & Join Workspace'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an active account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <Card className="p-8">
          <LoadingSpinner size="md" label="Loading invitation..." />
        </Card>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}

