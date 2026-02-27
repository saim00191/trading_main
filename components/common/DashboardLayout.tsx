'use client';

import React from 'react';
import { Navigation } from './Navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Navigation />

      {/* Main content */}
      <main className="w-full flex-1 md:ml-64">
        {/* Header */}
        {title && (
          <div className="border-b border-border/50 bg-card/30 px-6 py-8">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
