'use client';

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  animated?: boolean;
}

export function MetricCard({
  label,
  value,
  change,
  icon,
  color = 'primary',
  className = '',
  animated = true,
}: MetricCardProps) {
  const colorMap = {
    primary: 'border-primary/30 hover:border-primary/60',
    success: 'border-success/30 hover:border-success/60',
    warning: 'border-warning/30 hover:border-warning/60',
    danger: 'border-danger/30 hover:border-danger/60',
    info: 'border-info/30 hover:border-info/60',
  };

  const textColorMap = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
  };

  const changeColor = change && change > 0 ? 'text-success' : change && change < 0 ? 'text-danger' : 'text-muted-foreground';

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border border-border/50 bg-card p-6
        transition-all duration-300 hover-glow hover-scale
        ${colorMap[color]} ${animated ? 'animate-fade-in' : ''}
        ${className}
      `}
    >
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity hover:opacity-100" />

      <div className="relative z-10">
        {/* Header with icon and label */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
          {icon && <div className="text-primary">{icon}</div>}
        </div>

        {/* Value */}
        <div className="mb-2 flex items-end gap-2">
          <span className="text-3xl font-semibold text-foreground">{value}</span>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
              {change > 0 ? <ArrowUp size={16} /> : change < 0 ? <ArrowDown size={16} /> : null}
              {Math.abs(change).toFixed(2)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
