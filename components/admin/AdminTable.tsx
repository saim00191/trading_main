'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Column<T, K extends keyof T = keyof T> {
  key: K;
  label: string;
  render?: (value: T[K], row: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T extends { id?: string | number }> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}
export function AdminTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data found',
  actions,
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    );
  }

  if (isEmpty || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {actions && <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, index) => (
            <motion.tr
              key={row.id || index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-muted/30 transition-colors"
            >
              {columns.map((column) => {
                const value = row[column.key];
                return (
                  <td
                    key={String(column.key)}
                    className={`px-6 py-4 text-sm text-foreground ${column.className || ''}`}
                  >
                    {column.render ? column.render(value, row) : String(value)}
                  </td>
                );
              })}
              {actions && (
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">{actions(row)}</div>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
