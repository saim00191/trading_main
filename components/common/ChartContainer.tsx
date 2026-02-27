'use client';

import React from 'react';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export function ChartContainer({
  title,
  description,
  children,
  className = '',
  animated = true,
}: ChartContainerProps) {
  return (
    <div
      className={`
        rounded-lg border border-border/50 bg-card p-6
        transition-all duration-300 hover-scale hover-glow
        ${animated ? 'animate-fade-in' : ''}
        ${className}
      `}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Chart content */}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
