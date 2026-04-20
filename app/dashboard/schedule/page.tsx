'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/dashboard/DataTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Schedule {
  id: number;
  employee_id: number;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  first_name: string;
  last_name: string;
}

export default function SchedulePage() {
  const { user, accessToken } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    shiftDate: '',
    startTime: '09:00',
    endTime: '17:00',
    shiftType: 'FULL_DAY',
  });

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/schedule', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch schedules');

      const data = await response.json();
      setSchedules(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    fetchSchedules();
  }, [accessToken]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          employeeId: user?.id,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error('Failed to create schedule');

      setFormData({
        shiftDate: '',
        startTime: '09:00',
        endTime: '17:00',
        shiftType: 'FULL_DAY',
      });
      setShowNewForm(false);
      setError('');
      await fetchSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    try {
      const response = await fetch(`/api/schedule/${scheduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to delete schedule');

      await fetchSchedules();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule');
    }
  };

  const columns = [
    {
      key: 'shift_date' as const,
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
    },
    {
      key: 'start_time' as const,
      label: 'Time',
      render: (_: any, row: Schedule) => `${row.start_time} - ${row.end_time}`,
    },
    {
      key: 'shift_type' as const,
      label: 'Type',
      render: (value: string) => (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-info-light text-foreground border border-border">
          {value === 'FULL_DAY' ? 'Full Day' : value === 'MORNING' ? 'Morning' : 'Evening'}
        </span>
      ),
    },
    {
      key: 'id' as const,
      label: 'Action',
      render: (_: any, row: Schedule) => (
        <Button
          onClick={() => handleDeleteSchedule(row.id)}
          variant="ghost"
          size="sm"
          className="text-error hover:bg-error-light hover:text-error"
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Schedule"
        description="Manage your shifts and work schedule"
        action={
          <Button onClick={() => setShowNewForm(!showNewForm)}>
            {showNewForm ? 'Cancel' : 'Add Shift'}
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
          <h2 className="text-lg font-semibold text-foreground mb-4">Add New Shift</h2>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Shift Date</label>
                <Input
                  type="date"
                  value={formData.shiftDate}
                  onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Shift Type</label>
                <select
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                >
                  <option value="FULL_DAY">Full Day</option>
                  <option value="MORNING">Morning (6AM - 2PM)</option>
                  <option value="EVENING">Evening (2PM - 10PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Time</label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">End Time</label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create Shift
            </Button>
          </form>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={schedules}
        keyField="id"
        isLoading={isLoading}
        isEmpty={schedules.length === 0}
        emptyMessage="No shifts scheduled. Add your first shift!"
      />
    </div>
  );
}
