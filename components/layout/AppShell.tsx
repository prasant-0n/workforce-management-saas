'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

export function AppShell({ children, sidebar, header, footer }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen flex-col md:flex-row">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden w-64 border-r border-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          {header && (
            <header className="border-b border-border bg-background">
              {header}
            </header>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>

          {/* Footer */}
          {footer && (
            <footer className="border-t border-border bg-surface">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
