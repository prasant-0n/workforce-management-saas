import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  isLoading?: boolean;
}

const variantStyles = {
  default: 'border-border bg-card text-foreground',
  success: 'border-success/20 bg-success-light text-foreground',
  warning: 'border-warning/20 bg-warning-light text-foreground',
  error: 'border-error/20 bg-error-light text-foreground',
};

export function StatCard({
  label,
  value,
  icon,
  description,
  variant = 'default',
  trend,
  isLoading = false,
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden p-6', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-sm font-medium text-foreground-secondary">{label}</p>
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-border-secondary" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          )}
          {description && (
            <p className="text-xs text-foreground-tertiary">{description}</p>
          )}
          {trend && (
            <div
              className={cn(
                'mt-2 flex items-center gap-1 text-xs font-medium',
                trend.direction === 'up' ? 'text-success' : 'text-error'
              )}
            >
              <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && <div className="text-2xl text-foreground-secondary">{icon}</div>}
      </div>
    </Card>
  );
}
