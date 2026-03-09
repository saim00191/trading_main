'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminTable } from '@/components/admin/AdminTable';

interface Trade {
  id: number;
  userEmail: string;
  pair: string;
  tradeType: 'Buy' | 'Sell';
  entryPrice: string;
  exitPrice: string;
  profitLoss: string;
  date: string;
}

const mockTrades: Trade[] = [
  {
    id: 1,
    userEmail: 'john@example.com',
    pair: 'EURUSD',
    tradeType: 'Buy',
    entryPrice: '1.0850',
    exitPrice: '1.0920',
    profitLoss: '+$70',
    date: '2024-03-05',
  },
  {
    id: 2,
    userEmail: 'alice@example.com',
    pair: 'GBPUSD',
    tradeType: 'Sell',
    entryPrice: '1.2650',
    exitPrice: '1.2580',
    profitLoss: '+$70',
    date: '2024-03-05',
  },
  {
    id: 3,
    userEmail: 'bob@example.com',
    pair: 'USDJPY',
    tradeType: 'Buy',
    entryPrice: '149.80',
    exitPrice: '149.20',
    profitLoss: '-$60',
    date: '2024-03-04',
  },
  {
    id: 4,
    userEmail: 'carol@example.com',
    pair: 'AUDUSD',
    tradeType: 'Buy',
    entryPrice: '0.6650',
    exitPrice: '0.6720',
    profitLoss: '+$70',
    date: '2024-03-04',
  },
];

export default function AdminTradesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pairFilter, setPairFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Buy' | 'Sell'>('All');

  const filteredTrades = useMemo(() => {
    return mockTrades.filter((trade) => {
      const matchesSearch = trade.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPair = pairFilter === 'All' || trade.pair === pairFilter;
      const matchesType = typeFilter === 'All' || trade.tradeType === typeFilter;
      return matchesSearch && matchesPair && matchesType;
    });
  }, [searchQuery, pairFilter, typeFilter]);

  const uniquePairs = ['All', ...new Set(mockTrades.map((t) => t.pair))];

  return (
    <AdminLayout>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">Trades Management</h1>
        <p className="text-muted-foreground">Monitor all platform trades</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 mb-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Pair Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-muted-foreground" />
            <select
              value={pairFilter}
              onChange={(e) => setPairFilter(e.target.value)}
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
            >
              {uniquePairs.map((pair) => (
                <option key={pair} value={pair}>
                  {pair === 'All' ? 'All Pairs' : pair}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'All' | 'Buy' | 'Sell')}
            className="px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
          >
            <option>All Types</option>
            <option>Buy</option>
            <option>Sell</option>
          </select>
        </div>
      </motion.div>

      {/* Trades Table */}
      <motion.div
        className="bg-card border border-border rounded-xl p-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AdminTable<Trade>
          columns={[
            { key: 'userEmail', label: 'User Email' },
            { key: 'pair', label: 'Currency Pair' },
            {
              key: 'tradeType',
              label: 'Type',
              render: (value) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  value === 'Buy' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                }`}>
                  {value}
                </span>
              ),
            },
            { key: 'entryPrice', label: 'Entry Price' },
            { key: 'exitPrice', label: 'Exit Price' },
            {
              key: 'profitLoss',
              label: 'P&L',
              render: (value) => (
                <span className={value.includes('+') ? 'text-success font-semibold' : 'text-danger font-semibold'}>
                  {value}
                </span>
              ),
            },
            { key: 'date', label: 'Date' },
          ]}
          data={filteredTrades}
        />
      </motion.div>
    </AdminLayout>
  );
}
