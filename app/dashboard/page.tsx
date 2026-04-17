'use client';

import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const getDashboardContent = () => {
    if (['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '')) {
      return (
        <div className="space-y-8">
          <PageHeader title="Admin Dashboard" description="Manage your organization and team" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Total Users" value="--" description="Active users in the system" />
            <StatCard label="Pending Approvals" value="--" description="Leave requests awaiting review" />
            <StatCard label="Active Teams" value="--" description="Departments and divisions" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Link href="/dashboard/users">
              <Card className="p-6 border border-border hover:border-primary hover:shadow-md transition cursor-pointer h-full">
                <h3 className="text-lg font-semibold text-foreground mb-2">User Management</h3>
                <p className="text-foreground-secondary text-sm">Add, remove, and manage users in your organization</p>
              </Card>
            </Link>
            <Link href="/dashboard/settings">
              <Card className="p-6 border border-border hover:border-primary hover:shadow-md transition cursor-pointer h-full">
                <h3 className="text-lg font-semibold text-foreground mb-2">Organization Settings</h3>
                <p className="text-foreground-secondary text-sm">Configure your workspace and leave policies</p>
              </Card>
            </Link>
          </div>
        </div>
      );
    }

    if (user?.role === 'MANAGER') {
      return (
        <div className="space-y-8">
          <PageHeader title="Team Dashboard" description="Oversee your team and manage approvals" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Team Members" value="--" description="In your team" />
            <StatCard label="On Leave Today" value="--" description="Team members absent" />
            <StatCard label="Pending Requests" value="--" description="Need your approval" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Link href="/dashboard/team">
              <Card className="p-6 border border-border hover:border-primary hover:shadow-md transition cursor-pointer h-full">
                <h3 className="text-lg font-semibold text-foreground mb-2">View Team</h3>
                <p className="text-foreground-secondary text-sm">See your team members and their schedules</p>
              </Card>
            </Link>
            <Link href="/dashboard/approvals">
              <Card className="p-6 border border-border hover:border-primary hover:shadow-md transition cursor-pointer h-full">
                <h3 className="text-lg font-semibold text-foreground mb-2">Approvals</h3>
                <p className="text-foreground-secondary text-sm">Review and approve leave requests</p>
              </Card>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <PageHeader title={`Welcome, ${user?.firstName}`} description="Manage your schedule and leave requests" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard label="Leave Balance" value="--" description="Days remaining this year" />
          <StatCard label="Pending Requests" value="--" description="Awaiting approval" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Link href="/dashboard/schedule">
            <Card className="p-6 border border-border hover:border-primary hover:shadow-md transition cursor-pointer h-full">
              <h3 className="text-lg font-semibold text-foreground mb-2">My Schedule</h3>
              <p className="text-foreground-secondary text-sm">View your upcoming shifts and schedule</p>
            </Card>
          </Link>
          <Link href="/dashboard/leave">
            <Card className="p-6 border border-border hover:border-primary hover:shadow-md transition cursor-pointer h-full">
              <h3 className="text-lg font-semibold text-foreground mb-2">Leave Requests</h3>
              <p className="text-foreground-secondary text-sm">Submit and manage your leave requests</p>
            </Card>
          </Link>
        </div>
      </div>
    );
  };

  return getDashboardContent();
}
