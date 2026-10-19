import { ReactNode } from 'react';
import Link from 'next/link';
import { Wrench } from 'lucide-react';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/login" className="flex items-center space-x-2 font-bold text-xl text-primary">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">FixFlow</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            AI-Assisted Enterprise Maintenance Management
          </p>
        </div>
        {children}
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} FixFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}

