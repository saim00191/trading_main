'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  DollarSign,
  LifeBuoy,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminNavItems: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Users', href: '/admin/users', icon: <Users size={20} /> },
  { label: 'Trades', href: '/admin/trades', icon: <TrendingUp size={20} /> },
  { label: 'Payments', href: '/admin/payments', icon: <DollarSign size={20} /> },
  { label: 'Support', href: '/admin/support', icon: <LifeBuoy size={20} /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={20} /> },
  { label: 'Profile', href: '/admin/profile', icon: <User size={20} /> },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-40 flex flex-col overflow-y-auto md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={{ x: -256 }}
        animate={{ x: isMobileOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Admin
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Trading Journal SaaS</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2">
          {adminNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    active
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.icon}
                  <span className="font-medium text-sm">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <motion.button
            onClick={() => {
              // Logout logic will be added later
              window.location.href = '/admin/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
