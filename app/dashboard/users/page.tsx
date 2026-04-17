'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/dashboard/DataTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  status: string;
}

export default function UsersPage() {
  const { user, accessToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE',
    department: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create user');

      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'EMPLOYEE',
        department: '',
      });
      setShowForm(false);
      setError('');
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to delete user');

      await fetchUsers();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update user role');

      await fetchUsers();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  if (!['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '')) {
    return (
      <div className="space-y-8">
        <PageHeader title="User Management" description="Manage team members and permissions" />
        <Card className="p-8 text-center border border-border">
          <p className="text-foreground-secondary">You don&apos;t have permission to view this page</p>
        </Card>
      </div>
    );
  }

  const columns = [
    {
      key: 'firstName' as const,
      label: 'Name',
      render: (_: any, row: User) => (
        <div>
          <p className="font-semibold text-foreground">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-xs text-foreground-secondary">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'department' as const,
      label: 'Department',
      render: (value: string) => <span className="text-sm text-foreground-secondary">{value || 'N/A'}</span>,
    },
    {
      key: 'role' as const,
      label: 'Role',
      render: (value: string, row: User) => (
        row.id === user?.id ? (
          <span className="text-sm font-medium text-foreground">{value}</span>
        ) : (
          <select
            value={value}
            onChange={(e) => handleUpdateRole(row.id, e.target.value)}
            className="px-2 py-1 border border-border rounded text-sm bg-input text-foreground"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        )
      ),
    },
    {
      key: 'id' as const,
      label: 'Action',
      render: (_: any, row: User) =>
        row.id !== user?.id && (
          <Button
            onClick={() => handleDeleteUser(row.id)}
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
        title="User Management"
        description="Add, remove, and manage team members"
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add User'}
          </Button>
        }
      />

      {error && (
        <Card className="p-4 bg-error-light border border-error text-error text-sm">
          {error}
        </Card>
      )}

      {showForm && (
        <Card className="p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Engineering"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create User
            </Button>
          </form>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={users}
        keyField="id"
        isLoading={isLoading}
        isEmpty={users.length === 0}
        emptyMessage="No users found"
      />
    </div>
  );
}
