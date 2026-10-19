import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <Card className="border-border/60 shadow-lg text-center">
      <CardHeader className="space-y-3 pb-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          Access Restricted
        </CardTitle>
        <CardDescription>
          You do not possess the required permissions to access this resource or perform this action.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        If you require elevated administrative or management privileges within your organization, please contact your workspace administrator.
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

