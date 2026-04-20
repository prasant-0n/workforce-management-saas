'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  status: string;
}

const roleStyles = {
  ADMIN: 'bg-error-light text-red-700 border border-red-300',
  SUPER_ADMIN: 'bg-error-light text-red-700 border border-red-300',
  MANAGER: 'bg-info-light text-blue-700 border border-blue-300',
  EMPLOYEE: 'bg-success-light text-green-700 border border-green-300',
};

export default function TeamPage() {
  const { user, accessToken } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) return;

    async function fetchTeamMembers() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error('Failed to fetch team members');

        const data = await response.json();
        setMembers(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team members');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamMembers();
  }, [accessToken]);

  const columns = [
    {
      key: 'firstName' as const,
      label: 'Name',
      render: (_: any, row: TeamMember) => (
        <div>
          <p className="font-semibold text-foreground">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-xs text-foreground-secondary">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role' as const,
      label: 'Role',
      render: (value: string) => (
        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', roleStyles[value as keyof typeof roleStyles] || roleStyles.EMPLOYEE)}>
          {value}
        </span>
      ),
    },
    {
      key: 'department' as const,
      label: 'Department',
      render: (value: string) => <span className="text-sm text-foreground-secondary">{value || 'N/A'}</span>,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', value === 'active' ? 'bg-success-light text-green-700 border-green-300' : 'bg-warning-light text-yellow-700 border-yellow-300')}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ];

  const activeCount = members.filter(m => m.status === 'active').length;
  const managerCount = members.filter(m => m.role === 'MANAGER').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team Members"
        description="Overview of all team members in your organization"
      />

      {error && (
        <Card className="p-4 bg-error-light border border-error text-error text-sm">
          {error}
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Members"
          value={members.length}
          description={`${activeCount} active members`}
        />
        <StatCard
          label="Active"
          value={activeCount}
          description={`${((activeCount / Math.max(members.length, 1)) * 100).toFixed(0)}% of team`}
        />
        <StatCard
          label="Managers"
          value={managerCount}
          description="Team leads and managers"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={members}
        keyField="id"
        isLoading={isLoading}
        isEmpty={members.length === 0}
        emptyMessage="No team members found"
      />
    </div>
  );
}
