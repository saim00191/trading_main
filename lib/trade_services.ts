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

  let pnl: number;
  if (side === 'BUY') {
    pnl = (exit_price - entry) * position_size;
  } else {
    // SELL
    pnl = (entry - exit_price) * position_size;
  }

  // PnL % based on position value
  const pnl_percent = (pnl / (entry * position_size)) * 100;

  return {
    pnl: parseFloat(pnl.toFixed(2)),
    pnl_percent: parseFloat(pnl_percent.toFixed(2)),
  };
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

  let risk: number;
  let reward: number;

  if (side === 'BUY') {
    risk = entry - stop_loss;
    reward = take_profit - entry;
  } else {
    // SELL
    risk = stop_loss - entry;
    reward = entry - take_profit;
  }

  if (risk <= 0) return 0; // avoid divide by zero
  return parseFloat((reward / risk).toFixed(2));
};

/**
 * Create a new trade - Fully typed
 */
// export const createTrade = async (
//   tradeData: Omit<Trade, 'id' | 'created_at'>
// ): Promise<Trade> => {
//   try {
//     const pnlCalc = calculatePnL({
//       side: tradeData.side,
//       entry: tradeData.entry,
//       exit_price: tradeData.exit_price,
//       position_size: tradeData.position_size,
//     });

//     const rr = calculateRiskReward({
//       entry: tradeData.entry,
//       stop_loss: tradeData.stop_loss,
//       take_profit: tradeData.take_profit,
//       side: tradeData.side,
//     });

//     const finalData: Omit<Trade, 'id' | 'created_at'> = {
//       ...tradeData,
//       pnl: pnlCalc.pnl,
//       pnl_percent: pnlCalc.pnl_percent,
//       risk_reward: rr,
//     };

//     const { data, error } = await supabase
//       .from('trades')
//       .insert([finalData])
//       .select();

//     if (error) throw new Error(error.message);
//     if (!data || data.length === 0) throw new Error('No trade returned');

//     return data[0] as Trade;
//   } catch (err) {
//     console.error('[Trade Service] CreateTrade Error:', err);
//     throw err instanceof Error ? err : new Error('Failed to create trade');
//   }
// };


export const createTrade = async (
  tradeData: Omit<Trade, 'id' | 'created_at'>
): Promise<Trade> => {
  try {
    console.log('[Trade Service] Creating trade:', tradeData);

    // Ensure status is valid for DB constraint
    const status = tradeData.status && ['OPEN', 'CLOSED'].includes(tradeData.status)
      ? tradeData.status
      : 'OPEN';

    const pnlCalc = calculatePnL({
      side: tradeData.side,
      entry: tradeData.entry,
      exit_price: tradeData.exit_price,
      position_size: tradeData.position_size,
    });

    const rr = calculateRiskReward({
      entry: tradeData.entry,
      stop_loss: tradeData.stop_loss,
      take_profit: tradeData.take_profit,
      side: tradeData.side,
    });

    const finalData: Omit<Trade, 'id' | 'created_at'> = {
      ...tradeData,
      pnl: pnlCalc.pnl,
      pnl_percent: pnlCalc.pnl_percent,
      risk_reward: rr,
      status, // ✅ Ensure valid
      opened_at: tradeData.opened_at || new Date().toISOString(),
    };

    console.log('[Trade Service] Final trade payload:', finalData);

    const { data, error } = await supabase
      .from('trades')
      .insert([finalData])
      .select();

    if (error) {
      console.error('[Trade Service] Supabase insert error:', error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      console.error('[Trade Service] No trade returned after insert');
      throw new Error('No trade returned');
    }

    console.log('[Trade Service] Trade created successfully:', data[0]);
    return data[0] as Trade;
  } catch (err) {
    console.error('[Trade Service] CreateTrade Error:', err);
    throw err instanceof Error ? err : new Error('Failed to create trade');
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
export const updateTrade = async (
  tradeId: string,
  updates: Partial<Trade>
): Promise<Trade> => {
  try {
    // Fetch existing trade
    const { data: existingData, error: fetchError } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (fetchError || !existingData) throw new Error('Trade not found');

    const updatedTrade = { ...existingData, ...updates };

    // Recalculate PnL & R:R if entry/exit/position/side/SL/TP changed
    if (
      updates.entry ||
      updates.exit_price ||
      updates.position_size ||
      updates.side ||
      updates.stop_loss ||
      updates.take_profit
    ) {
      const pnlCalc = calculatePnL({
        side: updatedTrade.side,
        entry: updatedTrade.entry,
        exit_price: updatedTrade.exit_price,
        position_size: updatedTrade.position_size,
      });

      const rr = calculateRiskReward({
        entry: updatedTrade.entry,
        stop_loss: updatedTrade.stop_loss,
        take_profit: updatedTrade.take_profit,
        side: updatedTrade.side,
      });

      updates.pnl = pnlCalc.pnl;
      updates.pnl_percent = pnlCalc.pnl_percent;
      updates.risk_reward = rr;
    }

    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', tradeId)
      .select();

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Trade not updated');

    return data[0] as Trade;
  } catch (err) {
    console.error('[Trade Service] UpdateTrade Error:', err);
    throw err instanceof Error ? err : new Error('Failed to update trade');
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
