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
  Bell,
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
  { label: 'Notifications', href: '/admin/notifications', icon: <Bell size={20} /> },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  // Mobile animation variants
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar for Desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:h-screen md:fixed md:top-0 md:left-0 md:border-r md:border-border md:bg-card">
        <SidebarContent isActive={isActive} />
      </div>

      {/* Sidebar for Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.aside
              className="fixed top-0 left-0 h-screen w-64 z-40 bg-card border-r border-border flex flex-col overflow-y-auto md:hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              transition={{ duration: 0.25 }}
            >
              <SidebarContent isActive={isActive} closeSidebar={() => setIsMobileOpen(false)} />
            </motion.aside>

            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Sidebar content reused for mobile + desktop
interface SidebarContentProps {
  isActive: (href: string) => boolean;
  closeSidebar?: () => void;
}

function SidebarContent({ isActive, closeSidebar }: SidebarContentProps) {
  return (
    <>
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
            <Link key={item.href} href={item.href} onClick={closeSidebar}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => {
            window.location.href = '/admin/login';
            if (closeSidebar) closeSidebar();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </>
  );
}