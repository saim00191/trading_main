'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AdminStatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export function AdminStatsCard({
  icon,
  title,
  value,
  trend,
  unit = '',
  color = 'primary',
}: AdminStatsCardProps) {
  const colorClasses = {
    primary: 'from-primary/10 to-primary/5 border-primary/30',
    success: 'from-success/10 to-success/5 border-success/30',
    warning: 'from-warning/10 to-warning/5 border-warning/30',
    danger: 'from-danger/10 to-danger/5 border-danger/30',
    info: 'from-info/10 to-info/5 border-info/30',
  };

  const textColorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 backdrop-blur-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-background/50 ${textColorClasses[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-success' : 'text-danger'}`}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-sm font-medium mb-2">{title}</p>
      <p className="text-2xl md:text-3xl font-bold text-foreground">
        {value}
        {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
      </p>
    </motion.div>
  );
}
