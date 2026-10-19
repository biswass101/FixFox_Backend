'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';

import { useForgotPasswordMutation } from '@/hooks/use-auth';
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

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordData) => {
    setServerError(null);
    try {
      await forgotPasswordMutation.mutateAsync(values);
      setIsSubmitted(true);
    } catch (error) {
      const formatted = formatApiError(error);
      setServerError(formatted.message);
      showErrorToast(error, 'Password reset request failed');
    }
  };

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">
          Reset password
        </CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send instructions to reset your password
        </CardDescription>
      </CardHeader>

      {isSubmitted ? (
        <CardContent className="space-y-4 pt-2">
          <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
              Reset email dispatched
            </h4>
            <p className="text-xs text-muted-foreground">
              If an account is associated with this email address, you will receive password reset instructions shortly.
            </p>
          </div>
          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Return to sign in
            </Link>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {serverError && (
              <div
                role="alert"
                className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20"
              >
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@organization.com"
                autoComplete="email"
                disabled={forgotPasswordMutation.isPending}
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                'Send reset instructions'
              )}
            </Button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-1 h-3 w-3" />
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

