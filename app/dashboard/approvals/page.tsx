'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  email: string;
}

export default function ApprovalsPage() {
  const { user, accessToken } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/leave/request?status=pending', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      setRequests(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (leaveRequestId: number) => {
    try {
      const response = await fetch('/api/leave/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ leaveRequestId, approved: true }),
      });

      if (!response.ok) throw new Error('Failed to approve request');

      await fetchPendingRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    }
  };

  const handleReject = async (leaveRequestId: number) => {
    try {
      const response = await fetch('/api/leave/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          leaveRequestId,
          approved: false,
          rejectionReason: rejectionReason || 'Request rejected',
        }),
      });

      if (!response.ok) throw new Error('Failed to reject request');

      await fetchPendingRequests();
      setRejectingId(null);
      setRejectionReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    }
  };

  if (!['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) {
    return (
      <div className="space-y-8">
        <PageHeader title="Leave Approvals" description="Review and approve leave requests" />
        <Card className="p-8 text-center border border-border">
          <p className="text-foreground-secondary">You don&apos;t have permission to view this page</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leave Approvals"
        description="Review and approve pending leave requests from your team"
      />

      {error && (
        <Card className="p-4 bg-error-light border border-error text-error text-sm">
          {error}
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-border-secondary rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-border-secondary rounded w-full mb-2"></div>
              <div className="h-3 bg-border-secondary rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center border border-border">
          <p className="text-foreground-secondary text-lg">All caught up! No pending leave requests</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="p-6 border border-border hover:border-primary transition">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">
                      {request.first_name} {request.last_name}
                    </h3>
                    <p className="text-sm text-foreground-secondary">{request.email}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-warning-light text-yellow-700 border border-yellow-300">
                    Pending
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-foreground-secondary font-medium">Leave Type</p>
                    <p className="text-sm font-semibold text-foreground mt-1">{request.leave_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-secondary font-medium">Start Date</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {new Date(request.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-secondary font-medium">End Date</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {new Date(request.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-secondary font-medium">Duration</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {Math.ceil((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                    </p>
                  </div>
                </div>

                {/* Reason */}
                {request.reason && (
                  <div>
                    <p className="text-xs text-foreground-secondary font-medium mb-1">Reason</p>
                    <p className="text-sm text-foreground">{request.reason}</p>
                  </div>
                )}

                {/* Action Buttons or Rejection Form */}
                {rejectingId === request.id ? (
                  <div className="space-y-3 bg-error-light/30 p-4 rounded-lg border border-error/20">
                    <textarea
                      placeholder="Provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-error/30 rounded-md text-sm text-foreground bg-background"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReject(request.id)}
                        className="flex-1 bg-error hover:bg-error/90"
                      >
                        Confirm Rejection
                      </Button>
                      <Button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason('');
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 bg-success hover:bg-success/90 text-white"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => setRejectingId(request.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
