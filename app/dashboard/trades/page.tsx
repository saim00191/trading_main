'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { TradeTable } from '@/components/common/TradeTable';
import { Modal } from '@/components/common/Modal';
import { AnimatedButton } from '@/components/common/AnimatedButton';
import { TradeForm } from '@/components/trade/TradeForm';
import { Plus, Download, Filter } from 'lucide-react';
import { mockTrades } from '@/lib/mock-data';
import { Trade } from '@/lib/types';
import { toast } from 'sonner';

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('all');
  const [filterSession, setFilterSession] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Filter and sort trades
  const filteredTrades = useMemo(() => {
    let result = trades;

    // Search by pair
    if (searchQuery) {
      result = result.filter((t) => t.pair.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by strategy
    if (filterStrategy !== 'all') {
      result = result.filter((t) => t.strategy === filterStrategy);
    }

    // Filter by session
    if (filterSession !== 'all') {
      result = result.filter((t) => t.session === filterSession);
    }

    // Sort
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'profit') {
      result.sort((a, b) => b.pnl - a.pnl);
    } else if (sortBy === 'rr') {
      result.sort((a, b) => b.riskRewardRatio - a.riskRewardRatio);
    }

    return result;
  }, [trades, searchQuery, filterStrategy, filterSession, sortBy]);

  const handleNewTrade = (formData: Partial<Trade>) => {
    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      date: new Date(),
      pair: formData.pair || 'EUR/USD',
      type: formData.type || 'BUY',
      entry: formData.entry || 0,
      exit: formData.exit || 0,
      stopLoss: formData.stopLoss || 0,
      takeProfit: formData.takeProfit || 0,
      positionSize: formData.positionSize || 0,
      riskPercent: formData.riskPercent || 0,
      riskRewardRatio: formData.riskRewardRatio || 1.0,
      pnl: (formData.exit || 0 - (formData.entry || 0)) * 10000,
      pnlPercent: formData.pnlPercent || 0,
      status: 'CLOSED',
      tradeType: formData.tradeType || 'DAY',
      strategy: formData.strategy || 'MA Crossover',
      session: formData.session || 'EUROPE',
      emotionBefore: formData.emotionBefore || 5,
      emotionAfter: formData.emotionAfter || 5,
      notes: formData.notes || '',
      tags: [],
    };

    setTrades([newTrade, ...trades]);
    setIsModalOpen(false);
    toast.success('Trade added successfully!');
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Pair', 'Type', 'Entry', 'Exit', 'Position Size', 'Risk %', 'R:R', 'P&L', 'Status', 'Strategy', 'Session', 'Notes'],
      ...filteredTrades.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.pair,
        t.type,
        t.entry.toFixed(4),
        t.exit.toFixed(4),
        t.positionSize.toFixed(2),
        t.riskPercent.toFixed(2),
        t.riskRewardRatio.toFixed(2),
        t.pnl.toFixed(2),
        t.status,
        t.strategy,
        t.session,
        t.notes,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trades.csv';
    a.click();
    toast.success('Trades exported successfully!');
  };

  const strategies = Array.from(new Set(trades.map((t) => t.strategy)));
  const sessions = Array.from(new Set(trades.map((t) => t.session)));

  return (
    <DashboardLayout title="Trade Journal" subtitle="Track and analyze all your trades">
      {/* Controls */}
      <section className="mb-8 space-y-4">
        {/* Top Action Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
            <input
              type="text"
              placeholder="Search by pair..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <AnimatedButton
              variant="outline"
              size="md"
              onClick={handleExport}
              icon={<Download size={18} />}
            >
              Export CSV
            </AnimatedButton>
            <AnimatedButton
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus size={18} />}
            >
              New Trade
            </AnimatedButton>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          </div>

          <select
            value={filterStrategy}
            onChange={(e) => setFilterStrategy(e.target.value)}
            className="rounded-lg border border-border/50 bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="all">All Strategies</option>
            {strategies.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="rounded-lg border border-border/50 bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="all">All Sessions</option>
            {sessions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border/50 bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="date">Sort by Date</option>
            <option value="profit">Sort by Profit</option>
            <option value="rr">Sort by R:R Ratio</option>
          </select>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="rounded-lg bg-card px-4 py-2">
            <span className="text-muted-foreground">Total Trades: </span>
            <span className="font-semibold text-foreground">{filteredTrades.length}</span>
          </div>
          <div className="rounded-lg bg-card px-4 py-2">
            <span className="text-muted-foreground">Win Rate: </span>
            <span className="font-semibold text-success">
              {(
                (filteredTrades.filter((t) => t.pnl > 0).length / filteredTrades.length || 0) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
          <div className="rounded-lg bg-card px-4 py-2">
            <span className="text-muted-foreground">Total P&L: </span>
            <span className={`font-semibold ${filteredTrades.reduce((sum, t) => sum + t.pnl, 0) > 0 ? 'text-success' : 'text-danger'}`}>
              ${filteredTrades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* Trades Table */}
      <TradeTable trades={filteredTrades} />

      {/* New Trade Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Trade">
        <TradeForm onSubmit={handleNewTrade} />
      </Modal>
    </DashboardLayout>
  );
}
