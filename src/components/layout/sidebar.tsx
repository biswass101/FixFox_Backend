'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  Users,
  Box,
  MapPin,
  BarChart3,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { useLogoutMutation } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Work Orders',
    href: '/work-orders',
    icon: ClipboardList,
  },
  {
    title: 'My Work Orders',
    href: '/my-work-orders',
    icon: CheckSquare,
    roles: ['TECHNICIAN'],
  },
  {
    title: 'Technicians',
    href: '/technicians',
    icon: Users,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    title: 'Assets',
    href: '/assets',
    icon: Box,
  },
  {
    title: 'Locations',
    href: '/locations',
    icon: MapPin,
  },
  {
    title: 'SLA & Faults',
    href: '/sla',
    icon: ShieldAlert,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const logoutMutation = useLogoutMutation();

  const userRole = user?.role || 'REPORTER';

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card transition-all duration-300 md:static',
        isSidebarOpen ? 'w-64' : 'w-20 md:w-20',
        !isSidebarOpen && 'max-md:-translate-x-full'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
            <Wrench className="h-5 w-5" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col truncate">
              <span className="text-base font-bold tracking-tight text-foreground">
                FixFlow
              </span>
              <span className="text-[10px] text-muted-foreground truncate uppercase font-semibold">
                {user?.organization?.name || 'Workspace'}
              </span>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hidden md:flex"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform duration-200', !isSidebarOpen && 'rotate-180')}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              title={!isSidebarOpen ? item.title : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {isSidebarOpen && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        {isSidebarOpen ? (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 p-2.5">
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-semibold text-foreground">
                {user?.fullName || 'User'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="text-[10px] py-0 px-1 font-semibold">
                  {user?.role || 'REPORTER'}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => logoutMutation.mutate()}
              title="Sign out"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => logoutMutation.mutate()}
              title="Sign out"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

