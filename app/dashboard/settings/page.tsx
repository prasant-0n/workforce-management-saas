'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LeaveType {
  id: number;
  name: string;
  days_per_year: number;
  carry_forward: number;
}

export default function SettingsPage() {
  const { user, accessToken } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewLeaveForm, setShowNewLeaveForm] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    name: '',
    daysPerYear: 20,
    carryForward: 0,
  });

  const fetchLeaveTypes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/leave/types', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to fetch leave types');

      const data = await response.json();
      setLeaveTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leave types');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    fetchLeaveTypes();
  }, [accessToken]);

  const handleCreateLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/leave/types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: leaveFormData.name,
          daysPerYear: parseInt(leaveFormData.daysPerYear.toString()),
          carryForward: parseInt(leaveFormData.carryForward.toString()),
        }),
      });

      if (!response.ok) throw new Error('Failed to create leave type');

      setLeaveFormData({
        name: '',
        daysPerYear: 20,
        carryForward: 0,
      });
      setShowNewLeaveForm(false);
      await fetchLeaveTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create leave type');
    }
  };

  if (!['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '')) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>
        <Card className="p-8 text-center border border-border">
          <p className="text-muted-foreground">You don&apos;t have permission to view this page</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

      {error && (
        <Card className="p-4 mb-6 bg-destructive/10 border border-destructive text-destructive">
          {error}
        </Card>
      )}

      <div className="space-y-8">
        {/* Organization Info */}
        <Card className="p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Organization Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tenant ID</p>
              <p className="text-foreground font-medium">{user?.tenantId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Role</p>
              <p className="text-foreground font-medium">{user?.role}</p>
            </div>
          </div>
        </Card>

        {/* Leave Types Management */}
        <Card className="p-6 border border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Leave Types</h2>
            <Button onClick={() => setShowNewLeaveForm(!showNewLeaveForm)} size="sm">
              {showNewLeaveForm ? 'Cancel' : 'Add Leave Type'}
            </Button>
          </div>

          {showNewLeaveForm && (
            <form onSubmit={handleCreateLeaveType} className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Leave Type Name
                  </label>
                  <Input
                    value={leaveFormData.name}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, name: e.target.value })}
                    placeholder="e.g., Vacation, Sick Leave"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Days Per Year
                  </label>
                  <Input
                    type="number"
                    value={leaveFormData.daysPerYear}
                    onChange={(e) =>
                      setLeaveFormData({ ...leaveFormData, daysPerYear: parseInt(e.target.value) })
                    }
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Carry Forward
                  </label>
                  <Input
                    type="number"
                    value={leaveFormData.carryForward}
                    onChange={(e) =>
                      setLeaveFormData({ ...leaveFormData, carryForward: parseInt(e.target.value) })
                    }
                    min="0"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create Leave Type
              </Button>
            </form>
          )}

          {isLoading ? (
            <p className="text-muted-foreground">Loading leave types...</p>
          ) : leaveTypes.length === 0 ? (
            <p className="text-muted-foreground">No leave types configured</p>
          ) : (
            <div className="space-y-2">
              {leaveTypes.map((leaveType) => (
                <div key={leaveType.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{leaveType.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {leaveType.days_per_year} days/year {leaveType.carry_forward > 0 && `• Carry forward: ${leaveType.carry_forward}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Organization Policies */}
        <Card className="p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Policies</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Leave approval workflow enabled</p>
            <p>Multi-tenant isolation enforced</p>
            <p>Role-based access control active</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
