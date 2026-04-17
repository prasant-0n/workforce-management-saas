'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/dashboard/DataTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LeaveRequest {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  leave_type: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface LeaveType {
  id: number;
  name: string;
  days_per_year: number;
}

const statusStyles = {
  pending: 'bg-warning-light text-yellow-700 border border-yellow-300',
  approved: 'bg-success-light text-green-700 border border-green-300',
  rejected: 'bg-error-light text-red-700 border border-red-300',
};

export default function LeavePage() {
  const { user, accessToken } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setIsLoading(true);
      const [requestsRes, typesRes] = await Promise.all([
        fetch('/api/leave/request', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch('/api/leave/types', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData);
      }

      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setLeaveTypes(typesData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/leave/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          leaveTypeId: parseInt(formData.leaveTypeId),
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
        }),
      });

      if (!response.ok) throw new Error('Failed to create leave request');

      setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      setShowNewForm(false);
      setError('');
      await fetchLeaveData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      const response = await fetch(`/api/leave/request/${requestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to cancel request');

      await fetchLeaveData();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel request');
    }
  };

  const columns = [
    {
      key: 'leave_type' as const,
      label: 'Leave Type',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'start_date' as const,
      label: 'Date Range',
      render: (_: any, row: LeaveRequest) => (
        <span className="text-sm">
          {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'reason' as const,
      label: 'Reason',
      render: (value: string) => <span className="text-foreground-secondary text-sm">{value || 'N/A'}</span>,
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', statusStyles[value as keyof typeof statusStyles])}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'id' as const,
      label: 'Action',
      render: (_: any, row: LeaveRequest) => (
        row.status === 'pending' && (
          <Button
            onClick={() => handleCancelRequest(row.id)}
            variant="ghost"
            size="sm"
            className="text-error hover:bg-error-light hover:text-error"
          >
            Cancel
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leave Requests"
        description="Manage your leave requests and view approval status"
        action={
          <Button onClick={() => setShowNewForm(!showNewForm)}>
            {showNewForm ? 'Cancel' : 'New Request'}
          </Button>
        }
      />

      {error && (
        <Card className="p-4 bg-error-light border border-error text-error text-sm">
          {error}
        </Card>
      )}

      {showNewForm && (
        <Card className="p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Submit Leave Request</h2>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Leave Type</label>
                <select
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                  required
                >
                  <option value="">Select leave type...</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.days_per_year} days/year)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Reason for leave"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Submit Request
            </Button>
          </form>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={requests}
        keyField="id"
        isLoading={isLoading}
        isEmpty={requests.length === 0}
        emptyMessage="No leave requests yet. Submit your first request!"
      />
    </div>
  );
}
