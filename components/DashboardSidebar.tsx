'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/schedule', label: 'Schedule', icon: '📅' },
    { href: '/dashboard/leave', label: 'Leave Requests', icon: '🗓️' },
    { href: '/dashboard/team', label: 'Team', icon: '👥' },
  ];

  // Add admin-only routes
  if (['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '')) {
    navItems.push(
      { href: '/dashboard/users', label: 'User Management', icon: '🔐' },
      { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' }
    );
  }

  // Add manager routes
  if (['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role || '')) {
    navItems.push({ href: '/dashboard/approvals', label: 'Approvals', icon: '✓' });
  }

  const isActiveLink = (href: string) => {
    if (typeof window === 'undefined') return false;
    return pathname === href;
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="space-y-1 border-b border-sidebar-border p-6">
        <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">WorkForce</h1>
        <p className="text-xs text-sidebar-foreground-secondary">Team Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <div
            key={item.href}
            onClick={() => handleNavigation(item.href)}
            className={cn(
              'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
              isActiveLink(item.href)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-border'
            )}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="space-y-3 border-t border-sidebar-border p-4">
        <div className="space-y-1 px-2">
          <p className="text-xs text-sidebar-foreground-secondary">Signed in as</p>
          <p className="text-sm font-semibold text-sidebar-foreground truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-sidebar-foreground-secondary truncate">{user?.email}</p>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-border hover:text-sidebar-foreground"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
