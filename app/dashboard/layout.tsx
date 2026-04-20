'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Always render the dashboard layout to avoid hydration mismatches
  // The authentication check happens in useEffect
  return (
    <AppShell sidebar={<DashboardSidebar />}>
      <PageContainer>{children}</PageContainer>
    </AppShell>
  );
}
