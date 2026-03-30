'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { TradeForm } from '@/components/trade/TradeForm';
import { TradeRow } from '@/components/trade/TradeRow';
import { Plus, Filter, X } from 'lucide-react';
import { Trade } from '@/lib/types';
import { createTrade, getTradesByUser, deleteTrade } from '@/lib/trade_services';
import { toast } from 'sonner';
import { selectUserEmail } from '@/store/UserLoggedInSlice';
import { supabase } from '@/lib/supabaseClient';

export default function TradesPage() {
  const userEmail = useSelector(selectUserEmail);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterPair, setFilterPair] = useState('all');
  const [filterSide, setFilterSide] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterMarket, setFilterMarket] = useState('all');
  const [filterSession, setFilterSession] = useState('all');
  const [filterExchange, setFilterExchange] = useState('all');

  // Load trades
  useEffect(() => {
    const loadTrades = async () => {
      if (!userEmail) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await getTradesByUser(userEmail);

        setTrades(data);
      } catch (error) {
        toast.error('Failed to load trades');
      } finally {
        setIsLoading(false);
      }
    };

    loadTrades();
  }, [userEmail]);

  // Apply filters
  const filteredTrades = useMemo(() => {
    let result = trades;

    if (filterPair !== 'all') result = result.filter((t) => t.pair === filterPair);
    if (filterSide !== 'all') result = result.filter((t) => t.side === filterSide);
    if (filterStatus !== 'all') result = result.filter((t) => t.status === filterStatus);
    if (filterType !== 'all') result = result.filter((t) => t.trade_type === filterType);
    if (filterMarket !== 'all') result = result.filter((t) => t.market === filterMarket);
    if (filterSession !== 'all') result = result.filter((t) => t.session === filterSession);
    if (filterExchange !== 'all') result = result.filter((t) => t.exchange === filterExchange);

return result.sort((a, b) => {
  const dateA = a.opened_at ? new Date(a.opened_at).getTime() : 0;
  const dateB = b.opened_at ? new Date(b.opened_at).getTime() : 0;
  return dateB - dateA;
});
  }, [trades, filterPair, filterSide, filterStatus, filterType, filterMarket, filterSession, filterExchange]);

  // Get unique values for filters
  const uniquePairs = Array.from(new Set(trades.map((t) => t.pair)));
  const uniqueExchanges = Array.from(new Set(trades.map((t) => t.exchange)));

  // const handleAddTrade = async (tradeData: Trade) => {
  //   try {

  //   console.log('--- handleAddTrade START ---');
  //   console.log('tradeData:', tradeData);
  //   console.log('userEmail:', userEmail);

  //   // Fetch user info from Supabase
  //   const { data: userData, error: userError } = await supabase
  //     .from('users')
  //     .select('id, user_type, trade_left_free_trial')
  //     .eq('email', userEmail)
  //     .single();

  //   console.log('Fetched userData:', userData);
  //   console.log('userError:', userError);

  //   if (userError) {
  //     console.error('[Supabase Fetch User Error]', userError);
  //     toast.error('Failed to fetch user data');
  //     return;
  //   }

  //   if (!userData) {
  //     console.error('[Supabase Fetch User] No userData returned');
  //     toast.error('User not found');
  //     return;
  //   }

  //   // If user is free, check trades left
  //   if (userData.user_type === 'free') {
  //     console.log('User is free. Trades left:', userData.trade_left_free_trial);

  //     if (userData.trade_left_free_trial <= 0) {
  //       console.warn('Free plan limit reached');
  //       toast.error('Free plan limit reached. Upgrade to pro to add more trades.');
  //       return;
  //     }

  //     // Decrement trade_left_free_trial
  //     console.log('Attempting to decrement trade_left_free_trial...');
  //     const { data: updatedData, error: updateError } = await supabase
  //       .from('users')
  //       .update({
  //         trade_left_free_trial: userData.trade_left_free_trial - 1,
  //         last_updated_at: new Date().toISOString()
  //       })
  //       .eq('id', userData.id)
  //       .select(); // Select updated row to confirm

  //     console.log('Updated Data:', updatedData);
  //     console.log('Update Error:', updateError);

  //     if (updateError) {
  //       console.error('[Supabase Update Error]', updateError);
  //       toast.error('Failed to update trade limit');
  //       return;
  //     }

  //     if (!updatedData || updatedData.length === 0) {
  //       console.warn('[Supabase Update Warning] No rows updated. Check RLS/policies.');
  //       toast.error('Trade limit not updated. Contact support.');
  //       return;
  //     }

  //     console.log('Trade limit decremented successfully.');
  //   } else {
  //     console.log('User is not free. Skipping trade limit check.');
  //   }


  //     // Use the trade service to create trade with all calculations
  //     const newTrade = await createTrade(tradeData);
  //     setTrades([newTrade, ...trades]);
  //     setIsModalOpen(false);
  //     toast.success('Trade saved successfully!');
  //   } catch (error) {
  //     console.error('[Trades Page] Error:', error);
  //     toast.error(error instanceof Error ? error.message : 'Failed to save trade');
  //   }
  // };

//   const handleAddTrade = async (tradeData: Trade) => {
//   try {
//     console.log('--- handleAddTrade START ---');
//     console.log('tradeData:', tradeData);
//     console.log('userEmail:', userEmail);

//     // Convert datetime-local strings to ISO for consistent storage
//     tradeData.opened_at = tradeData.opened_at ? new Date(tradeData.opened_at).toISOString() : undefined;
//     tradeData.closed_at = tradeData.closed_at ? new Date(tradeData.closed_at).toISOString() : undefined;

//     // Fetch user info from Supabase
//     const { data: userData, error: userError } = await supabase
//       .from('users')
//       .select('id, user_type, trade_left_free_trial')
//       .eq('email', userEmail)
//       .single();

//     if (userError) {
//       console.error('[Supabase Fetch User Error]', userError);
//       toast.error('Failed to fetch user data');
//       return;
//     }

//     if (!userData) {
//       console.error('[Supabase Fetch User] No userData returned');
//       toast.error('User not found');
//       return;
//     }

//     // Free plan: check trade limits
//     if (userData.user_type === 'free') {
//       if (userData.trade_left_free_trial <= 0) {
//         toast.error('Free plan limit reached. Upgrade to pro to add more trades.');
//         return;
//       }

//       // Decrement trades left
//       const { data: updatedData, error: updateError } = await supabase
//         .from('users')
//         .update({
//           trade_left_free_trial: userData.trade_left_free_trial - 1,
//           last_updated_at: new Date().toISOString()
//         })
//         .eq('id', userData.id)
//         .select();

//       if (updateError || !updatedData || updatedData.length === 0) {
//         console.error('[Supabase Update Error]', updateError);
//         toast.error('Failed to update trade limit');
//         return;
//       }
//     }

//     // Create trade via service
//     const newTrade = await createTrade(tradeData);

//     // Ensure dates are parsed for immediate display
//     newTrade.opened_at = newTrade.opened_at ? new Date(newTrade.opened_at).toISOString() : undefined;
//     newTrade.closed_at = newTrade.closed_at ? new Date(newTrade.closed_at).toISOString() : undefined;

//     setTrades([newTrade, ...trades]);
//     setIsModalOpen(false);
//     toast.success('Trade saved successfully!');
//   } catch (error) {
//     console.error('[Trades Page] Error:', error);
//     toast.error(error instanceof Error ? error.message : 'Failed to save trade');
//   }
// };

const handleAddTrade = async (tradeData: Trade) => {
  try {
    console.log('--- handleAddTrade START ---');
    console.log('tradeData:', tradeData);
    console.log('userEmail:', userEmail);

    // Store user local datetime as-is (from input type="datetime-local")
    tradeData.opened_at = tradeData.opened_at ? tradeData.opened_at : undefined;
    tradeData.closed_at = tradeData.closed_at ? tradeData.closed_at : undefined;

    // Fetch user info from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, user_type, trade_left_free_trial')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.error('[Supabase Fetch User Error]', userError);
      toast.error('Failed to fetch user data');
      return;
    }

    if (!userData) {
      console.error('[Supabase Fetch User] No userData returned');
      toast.error('User not found');
      return;
    }

    // Free plan: check trade limits
    if (userData.user_type === 'free') {
      if (userData.trade_left_free_trial <= 0) {
        toast.error('Free plan limit reached. Upgrade to pro to add more trades.');
        return;
      }

      // Decrement trades left
      const { data: updatedData, error: updateError } = await supabase
        .from('users')
        .update({
          trade_left_free_trial: userData.trade_left_free_trial - 1,
          last_updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)
        .select();

      if (updateError || !updatedData || updatedData.length === 0) {
        console.error('[Supabase Update Error]', updateError);
        toast.error('Failed to update trade limit');
        return;
      }
    }

    // Create trade via service
    const newTrade = await createTrade(tradeData);

    // Keep local datetime strings for display (no UTC conversion)
    setTrades([newTrade, ...trades]);
    setIsModalOpen(false);
    toast.success('Trade saved successfully!');
  } catch (error) {
    console.error('[Trades Page] Error:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to save trade');
  }
};

  const handleDeleteTrade = async (tradeId: string) => {
    try {
      await deleteTrade(tradeId);
      setTrades(trades.filter((t) => t.id !== tradeId));
      toast.success('Trade deleted');
    } catch (error) {
      toast.error('Failed to delete trade');
    }
  };

  // const handleExportCSV = () => {
  //   const csv = [
  //     ['Date', 'Pair', 'Side', 'Entry', 'Exit', 'SL', 'TP', 'Size', 'Risk%', 'R:R', 'P&L', '%', 'Type', 'Market', 'Exchange', 'Strategy', 'Session'],
  //     ...filteredTrades.map((t) => [
  //        t.opened_at ? new Date(t.opened_at).toLocaleDateString() : '',
  //       t.pair,
  //       t.side,
  //       t.entry.toFixed(4),
  //       t.exit_price.toFixed(4),
  //       t.stop_loss.toFixed(4),
  //       t.take_profit.toFixed(4),
  //       t.position_size,
  //       t.risk_percent,
  //       t.risk_reward?.toFixed(2),
  //       t.pnl?.toFixed(2),
  //       t.pnl_percent?.toFixed(2),
  //       t.trade_type,
  //       t.market,
  //       t.exchange,
  //       t.strategy,
  //       t.session,
  //     ]),
  //   ]
  //     .map((row) => row.join(','))
  //     .join('\n');

  //   const blob = new Blob([csv], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `trades-${new Date().toISOString().split('T')[0]}.csv`;
  //   a.click();
  //   toast.success('Trades exported');
  // };

  const handleExportCSV = () => {
  if (!filteredTrades.length) {
    toast.error('No trades to export');
    return;
  }

  const csvRows = [
    [
      'Date',
      'Pair',
      'Side',
      'Entry',
      'Exit',
      'SL',
      'TP',
      'Size',
      'Risk%',
      'R:R',
      'P&L',
      '%',
      'Type',
      'Market',
      'Exchange',
      'Strategy',
      'Session',
    ],
    ...filteredTrades.map((t) => [
      t.opened_at ? new Date(t.opened_at).toLocaleString() : '',
      t.pair,
      t.side,
      t.entry.toFixed(4),
      t.exit_price.toFixed(4),
      t.stop_loss.toFixed(4),
      t.take_profit.toFixed(4),
      t.position_size,
      t.risk_percent,
      t.risk_reward?.toFixed(2) ?? '',
      t.pnl?.toFixed(2) ?? '',
      t.pnl_percent?.toFixed(2) ?? '',
      t.trade_type,
      t.market,
      t.exchange,
      t.strategy,
      t.session,
    ]),
  ];

  const csvContent = csvRows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `trades-${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
  a.click();
  toast.success('Trades exported successfully!');
};
  return (
    <DashboardLayout title="Trade Journal" subtitle="Track and manage all your trades">
      {/* Add Trade Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-h-[90vh] overflow-y-auto max-w-4xl"
            >
              <div className="flex justify-between items-center p-4 md:p-6 bg-card border border-border/50 rounded-t-lg sticky top-0 z-10">
                <h2 className="text-lg md:text-2xl font-bold text-foreground">Add Trade</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>
              <TradeForm onSubmit={handleAddTrade} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 md:gap-4 mb-6">
        <div className="flex flex-wrap gap-2 md:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 text-sm md:text-base"
          >
            <Plus size={18} />
            New Trade
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-card/80 text-sm md:text-base font-semibold"
          >
            Export CSV
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-card/80 text-sm md:text-base font-semibold"
          >
            <Filter size={18} />
            Filters {showFilters ? '×' : ''}
          </motion.button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-card border border-border/50 rounded-lg"
            >
              <select value={filterPair} onChange={(e) => setFilterPair(e.target.value)} className="px-2 py-1 text-xs md:text-sm bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="all">All Pairs</option>
                {uniquePairs.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select value={filterSide} onChange={(e) => setFilterSide(e.target.value)} className="px-2 py-1 text-xs md:text-sm bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="all">All Sides</option>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>

              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-2 py-1 text-xs md:text-sm bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="all">All Status</option>
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-2 py-1 text-xs md:text-sm bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="all">All Types</option>
                <option value="SCALP">SCALP</option>
                <option value="DAY">DAY</option>
                <option value="SWING">SWING</option>
              </select>

              <select value={filterMarket} onChange={(e) => setFilterMarket(e.target.value)} className="px-2 py-1 text-xs md:text-sm bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="all">All Markets</option>
                <option value="FOREX">FOREX</option>
                <option value="CRYPTO">CRYPTO</option>
                <option value="STOCKS">STOCKS</option>
                <option value="FUTURES">FUTURES</option>
              </select>

              <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)} className="px-2 py-1 text-xs md:text-sm bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="all">All Sessions</option>
                <option value="ASIA">ASIA</option>
                <option value="EUROPE">EUROPE</option>
                <option value="NEWYORK">NEWYORK</option>
              </select>

              <select value={filterExchange} onChange={(e) => setFilterExchange(e.target.value)} className="px-2 py-1 text-xs md:text-sm bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="all">All Exchanges</option>
                {uniqueExchanges.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto bg-card border border-border/50 rounded-lg">
        {isLoading ? (
          <div className="p-8 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-muted-foreground">Loading trades...</p>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No trades found</p>
            <button onClick={() => setIsModalOpen(true)} className="text-primary font-semibold hover:underline">Add your first trade</button>
          </div>
        ) : (
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">↓</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">Pair</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">Side</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">Entry</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">Exit</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">P&L</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">%</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">Type</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">Date</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">Status</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-left text-muted-foreground font-semibold">×</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredTrades.map((trade) => (
                  <TradeRow key={trade.id} trade={trade} onDelete={handleDeleteTrade} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Stats */}
      {filteredTrades.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-3 bg-card border border-border/50 rounded">
            <p className="text-xs text-muted-foreground">Total Trades</p>
            <p className="text-xl md:text-2xl font-bold text-foreground">{filteredTrades.length}</p>
          </div>
          <div className="p-3 bg-card border border-border/50 rounded">
            <p className="text-xs text-muted-foreground">Total P&L</p>
            <p className={`text-xl md:text-2xl font-bold ${filteredTrades.reduce((sum, t) => sum + t.pnl, 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              {filteredTrades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-card border border-border/50 rounded">
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {((filteredTrades.filter((t) => t.pnl > 0).length / filteredTrades.length) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-card border border-border/50 rounded">
            <p className="text-xs text-muted-foreground">Avg P&L</p>
            <p className={`text-xl md:text-2xl font-bold ${(filteredTrades.reduce((sum, t) => sum + t.pnl, 0) / filteredTrades.length) >= 0 ? 'text-success' : 'text-danger'}`}>
              {(filteredTrades.reduce((sum, t) => sum + t.pnl, 0) / filteredTrades.length).toFixed(2)}
            </p>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
