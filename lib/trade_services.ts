/**
 * Trade Service - Handles all trade-related Supabase operations
 * Type-safe service layer for trade management
 */

import { Trade } from '@/lib/types';
import { supabase } from './supabaseClient'


export const calculatePnL = (trade: {
  side: 'BUY' | 'SELL';
  entry: number;
  exit_price: number;
  position_size: number;
}): { pnl: number; pnl_percent: number } => {
  const { side, entry, exit_price, position_size } = trade;

  if (side === 'BUY') {
    const pnl = (exit_price - entry) * position_size;
    const pnl_percent = ((exit_price - entry) / entry) * 100;
    return {
      pnl: parseFloat(pnl.toFixed(2)),
      pnl_percent: parseFloat(pnl_percent.toFixed(2)),
    };
  } else {
    // SELL
    const pnl = (entry - exit_price) * position_size;
    const pnl_percent = ((entry - exit_price) / entry) * 100;
    return {
      pnl: parseFloat(pnl.toFixed(2)),
      pnl_percent: parseFloat(pnl_percent.toFixed(2)),
    };
  }
};

/**
 * Calculate Risk:Reward Ratio
 */
export const calculateRiskReward = (trade: {
  entry: number;
  stop_loss: number;
  take_profit: number;
  side: 'BUY' | 'SELL';
}): number => {
  const { entry, stop_loss, take_profit, side } = trade;

  if (side === 'BUY') {
    const risk = entry - stop_loss;
    const reward = take_profit - entry;
    return risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 0;
  } else {
    // SELL
    const risk = stop_loss - entry;
    const reward = entry - take_profit;
    return risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 0;
  }
};

/**
 * Create a new trade - Fully typed
 */
export const createTrade = async (tradeData: Omit<Trade, 'id' | 'created_at'>): Promise<Trade> => {
  try {
    // Calculate PnL if not already calculated
    let finalData = { ...tradeData };

    if (!finalData.pnl || !finalData.pnl_percent) {
      const pnlCalc = calculatePnL({
        side: finalData.side,
        entry: finalData.entry,
        exit_price: finalData.exit_price,
        position_size: finalData.position_size,
      });
      finalData.pnl = pnlCalc.pnl;
      finalData.pnl_percent = pnlCalc.pnl_percent;
    }

    // Calculate R:R if not already calculated
    if (!finalData.risk_reward || finalData.risk_reward === 0) {
      finalData.risk_reward = calculateRiskReward({
        entry: finalData.entry,
        stop_loss: finalData.stop_loss,
        take_profit: finalData.take_profit,
        side: finalData.side,
      });
    }

    const { data, error } = await supabase
      .from('trades')
      .insert([finalData])
      .select();

    if (error) {
      throw new Error(`Failed to create trade: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from server');
    }

    return data[0] as Trade;
  } catch (error) {
    console.error('[Trade Service] Create error:', error);
    throw error instanceof Error ? error : new Error('Failed to create trade');
  }
};

/**
 * Get all trades for a user - Fully typed
 */
export const getTradesByUser = async (userEmail: string): Promise<Trade[]> => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('useremail', userEmail)
      .order('opened_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch trades: ${error.message}`);
    }

    return (data || []) as Trade[];
  } catch (error) {
    console.error('[Trade Service] Fetch error:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch trades');
  }
};

/**
 * Get trades by date range - Fully typed
 */
export const getTradesByDateRange = async (
  userEmail: string,
  startDate: Date,
  endDate: Date
): Promise<Trade[]> => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('useremail', userEmail)
      .gte('opened_at', startDate.toISOString())
      .lte('opened_at', endDate.toISOString())
      .order('opened_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch trades: ${error.message}`);
    }

    return (data || []) as Trade[];
  } catch (error) {
    console.error('[Trade Service] Date range fetch error:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch trades for date range');
  }
};

/**
 * Update a trade - Fully typed
 */
export const updateTrade = async (tradeId: string, updates: Partial<Trade>): Promise<Trade> => {
  try {
    // Recalculate PnL if relevant fields changed
    if (updates.exit_price || updates.position_size || updates.side) {
      const existingTrade = await supabase.from('trades').select('*').eq('id', tradeId).single();
      if (existingTrade.data) {
        const trade = { ...existingTrade.data, ...updates };
        const pnlCalc = calculatePnL({
          side: trade.side,
          entry: trade.entry,
          exit_price: trade.exit_price,
          position_size: trade.position_size,
        });
        updates.pnl = pnlCalc.pnl;
        updates.pnl_percent = pnlCalc.pnl_percent;
      }
    }

    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', tradeId)
      .select();

    if (error) {
      throw new Error(`Failed to update trade: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Trade not found');
    }

    return data[0] as Trade;
  } catch (error) {
    console.error('[Trade Service] Update error:', error);
    throw error instanceof Error ? error : new Error('Failed to update trade');
  }
};

/**
 * Delete a trade - Fully typed
 */
export const deleteTrade = async (tradeId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('trades').delete().eq('id', tradeId);

    if (error) {
      throw new Error(`Failed to delete trade: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('[Trade Service] Delete error:', error);
    throw error instanceof Error ? error : new Error('Failed to delete trade');
  }
};

/**
 * Get trade statistics for a user
 */
export const getTradeStats = async (userEmail: string) => {
  try {
    const trades = await getTradesByUser(userEmail);

    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnL: 0,
        averageWin: 0,
        averageLoss: 0,
        winRate: 0,
        profitFactor: 0,
      };
    }

    const winningTrades = trades.filter((t) => t.pnl > 0);
    const losingTrades = trades.filter((t) => t.pnl < 0);

    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalPnL: parseFloat(totalPnL.toFixed(2)),
      averageWin: winningTrades.length > 0 ? parseFloat((totalWins / winningTrades.length).toFixed(2)) : 0,
      averageLoss: losingTrades.length > 0 ? parseFloat((totalLosses / losingTrades.length).toFixed(2)) : 0,
      winRate: parseFloat(((winningTrades.length / trades.length) * 100).toFixed(2)),
      profitFactor: totalLosses > 0 ? parseFloat((totalWins / totalLosses).toFixed(2)) : 0,
    };
  } catch (error) {
    console.error('[Trade Service] Stats error:', error);
    throw error instanceof Error ? error : new Error('Failed to calculate trade statistics');
  }
};
