'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getAllTrades, getUniquePairs, getUniqueMarkets, getUniqueExchanges, getTradeStats, type AdminTrade, type TradeFilters } from '@/lib/admin/adminTradesService';

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<AdminTrade[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter states
  const [filters, setFilters] = useState<TradeFilters>({});
  const [pairs, setPairs] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [exchanges, setExchanges] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalTrades: 0, winnersCount: 0, losersCount: 0, totalPnL: 0 });

  // Load filter options and initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [pairsData, marketsData, exchangesData, statsData, tradesData] = await Promise.all([
          getUniquePairs(),
          getUniqueMarkets(),
          getUniqueExchanges(),
          getTradeStats(),
          getAllTrades({}, 1, limit),
        ]);

        setPairs(pairsData);
        setMarkets(marketsData);
        setExchanges(exchangesData);
        setStats(statsData);
        setTrades(tradesData.trades);
        setTotal(tradesData.total);
      } catch (error) {
        console.error('[Admin Trades] Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [limit]);

  // Load trades when filters change
  useEffect(() => {
    const loadTrades = async () => {
      try {
        setIsLoading(true);
        const combinedFilters: TradeFilters = { ...filters };
        if (search) combinedFilters.search = search;

        const result = await getAllTrades(combinedFilters, page, limit);
        setTrades(result.trades);
        setTotal(result.total);
      } catch (error) {
        console.error('[Admin Trades] Error loading trades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrades();
  }, [filters, search, page, limit]);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleFilterChange = (key: keyof TradeFilters, value: string | undefined) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const winRate = stats.totalTrades > 0 ? ((stats.winnersCount / stats.totalTrades) * 100).toFixed(2) : '0';
  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout>
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-foreground mb-2">All Trades</h1>
        <p className="text-muted-foreground">Monitor all trading activity across the platform</p>
      </motion.div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div className="bg-card border border-border rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-primary">{stats.totalTrades}</p>
        </motion.div>
        <motion.div className="bg-card border border-border rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p className="text-sm text-muted-foreground mb-1">Winners</p>
          <p className="text-2xl font-bold text-success">{stats.winnersCount}</p>
        </motion.div>
        <motion.div className="bg-card border border-border rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-info">{winRate}%</p>
        </motion.div>
        <motion.div className="bg-card border border-border rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
          <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>₹{stats.totalPnL.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <motion.div className="bg-card border border-border rounded-lg p-6 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-6">
          <label className="flex items-center gap-2 bg-input border border-border rounded-lg px-4 py-2">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by username, email, or pair..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Pair Filter */}
          <select
            value={filters.pair || ''}
            onChange={(e) => handleFilterChange('pair', e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm"
          >
            <option value="">All Pairs</option>
            {pairs.map((pair) => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>

          {/* Market Filter */}
          <select
            value={filters.market || ''}
            onChange={(e) => handleFilterChange('market', e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm"
          >
            <option value="">All Markets</option>
            {markets.map((market) => (
              <option key={market} value={market}>
                {market}
              </option>
            ))}
          </select>

          {/* Trade Type Filter */}
          <select
            value={filters.trade_type || ''}
            onChange={(e) => handleFilterChange('trade_type', e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm"
          >
            <option value="">All Types</option>
            <option value="SCALP">Scalp</option>
            <option value="DAY">Day</option>
            <option value="SWING">Swing</option>
          </select>

          {/* Side Filter */}
          <select
            value={filters.side || ''}
            onChange={(e) => handleFilterChange('side', e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm"
          >
            <option value="">All Sides</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>

          {/* Session Filter */}
          <select
            value={filters.session || ''}
            onChange={(e) => handleFilterChange('session', e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm"
          >
            <option value="">All Sessions</option>
            <option value="ASIA">Asia</option>
            <option value="EUROPE">Europe</option>
            <option value="NEWYORK">New York</option>
          </select>

          {/* Exchange Filter */}
          <select
            value={filters.exchange || ''}
            onChange={(e) => handleFilterChange('exchange', e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm"
          >
            <option value="">All Exchanges</option>
            {exchanges.map((exchange) => (
              <option key={exchange} value={exchange}>
                {exchange}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Trades Table */}
      <motion.div className="bg-card border border-border rounded-lg overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : trades.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No trades found matching your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Pair</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Side</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Entry</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Exit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">P&L</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Market</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <React.Fragment key={trade.id}>
                      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-foreground font-medium">{trade.username}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{trade.useremail}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{trade.pair}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${trade.side === 'BUY' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                            {trade.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{trade.entry.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{trade.exit_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <span className={trade.pnl >= 0 ? 'text-success' : 'text-danger'}>
                            ₹{trade.pnl.toFixed(2)} ({trade.pnl_percent.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground text-xs">{trade.trade_type}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground text-xs">{trade.market}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${trade.status === 'CLOSED' ? 'bg-primary/20 text-primary' : 'bg-warning/20 text-warning'}`}>
                            {trade.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            onClick={() => toggleRow(trade.id)}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <ChevronDown size={16} className={`transform transition-transform ${expandedRows.has(trade.id) ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRows.has(trade.id) && (
                        <tr className="bg-muted/30 border-b border-border">
                          <td colSpan={11} className="px-4 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Stop Loss</p>
                                <p className="text-foreground font-medium">{trade.stop_loss.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Take Profit</p>
                                <p className="text-foreground font-medium">{trade.take_profit.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Position Size</p>
                                <p className="text-foreground font-medium">{trade.position_size.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Risk %</p>
                                <p className="text-foreground font-medium">{trade.risk_percent.toFixed(2)}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Risk:Reward</p>
                                <p className="text-foreground font-medium">{trade.risk_reward.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Session</p>
                                <p className="text-foreground font-medium">{trade.session}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Strategy</p>
                                <p className="text-foreground font-medium">{trade.strategy}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Exchange</p>
                                <p className="text-foreground font-medium">{trade.exchange}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-muted-foreground text-xs mb-1">Opened</p>
                                <p className="text-foreground font-medium text-xs">{new Date(trade.opened_at).toLocaleString()}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-muted-foreground text-xs mb-1">Closed</p>
                                <p className="text-foreground font-medium text-xs">{new Date(trade.closed_at).toLocaleString()}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-muted-foreground text-xs mb-1">Emotions (Before/After)</p>
                                <p className="text-foreground font-medium">{trade.emotion_before}/10 → {trade.emotion_after}/10</p>
                              </div>
                              {trade.notes && (
                                <div className="md:col-span-2">
                                  <p className="text-muted-foreground text-xs mb-1">Notes</p>
                                  <p className="text-foreground font-medium text-xs">{trade.notes}</p>
                                </div>
                              )}
                              {trade.tags && trade.tags.length > 0 && (
                                <div className="md:col-span-2">
                                  <p className="text-muted-foreground text-xs mb-1">Tags</p>
                                  <div className="flex gap-2 flex-wrap">
                                    {trade.tags.map((tag) => (
                                      <span key={tag} className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-muted/50 px-4 py-4 flex items-center justify-between border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} trades
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-border text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-border text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AdminLayout>
  );
}
