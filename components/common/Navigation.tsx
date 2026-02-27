'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BarChart3, TrendingUp, Brain, Shield, BookOpen, Calendar, Target, Settings } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Trade Journal', href: '/trades', icon: BookOpen },
  { label: 'Analytics', href: '/analytics', icon: TrendingUp },
  { label: 'AI Coach', href: '/ai-coach', icon: Brain },
  { label: 'Risk Management', href: '/risk-management', icon: Shield },
  { label: 'Trading Plan', href: '/trading-plan', icon: BookOpen },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Goals', href: '/goals', icon: Target },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed right-4 top-4 z-50 rounded-lg bg-primary p-2 text-primary-foreground md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar transition-transform duration-300
          transform md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          border-r border-sidebar-border overflow-y-auto
        `}
      >
        <div className="p-6">
          {/* Logo/Title */}
          <div className="mb-8 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">TradeLab</h1>
          </div>

          {/* Navigation items */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300
                    ${
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border bg-sidebar p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground transition-all duration-300 hover:bg-sidebar-accent/10">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}
