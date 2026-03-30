'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { getTradesByUser } from '@/lib/trade_services';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Trade } from '@/lib/types';
import { selectUserEmail } from '@/store/UserLoggedInSlice';

export default function CalendarPage() {
  const userEmail = useSelector(selectUserEmail);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load trades
  useEffect(() => {
    const loadTrades = async () => {
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getTradesByUser(userEmail );
        setTrades(data);
      } catch (error) {
        toast.error('Failed to load trades');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrades();
  }, [userEmail]);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Build trading data map
  const tradingDataMap = useMemo(() => {
    const map = new Map<string, { trades: Trade[]; pnl: number; wins: number; losses: number }>();

    trades.forEach((trade) => {
      const tradeDate = new Date(trade.opened_at || Date.now());
      const dateKey = `${tradeDate.getFullYear()}-${tradeDate.getMonth()}-${tradeDate.getDate()}`;

      if (!map.has(dateKey)) {
        map.set(dateKey, { trades: [], pnl: 0, wins: 0, losses: 0 });
      }

      const data = map.get(dateKey)!;
      data.trades.push(trade);
      data.pnl += trade.pnl;
      if (trade.pnl > 0) data.wins += 1;
      else if (trade.pnl < 0) data.losses += 1;
    });

    return map;
  }, [trades]);

  // Calculate month stats
  const monthStats = useMemo(() => {
    let totalTrades = 0;
    let totalPnL = 0;
    let tradingDays = 0;
    let winningDays = 0;
    let losingDays = 0;

    tradingDataMap.forEach((data) => {
      totalTrades += data.trades.length;
      totalPnL += data.pnl;
      tradingDays += 1;
      if (data.pnl > 0) winningDays += 1;
      else if (data.pnl < 0) losingDays += 1;
    });

    return { totalTrades, totalPnL, tradingDays, winningDays, losingDays };
  }, [tradingDataMap]);

  const getColor = (pnl: number | undefined) => {
    if (pnl === undefined) return 'bg-muted/10';
    if (pnl > 100) return 'bg-success/80';
    if (pnl > 50) return 'bg-success/60';
    if (pnl > 0) return 'bg-success/40';
    if (pnl > -50) return 'bg-danger/40';
    if (pnl > -100) return 'bg-danger/60';
    return 'bg-danger/80';
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <DashboardLayout title="Trading Calendar" subtitle="View your daily trading statistics">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Month Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="rounded-lg border border-border/50 bg-card p-4 md:p-6">
            <p className="text-xs md:text-sm font-medium text-muted-foreground">Trading Days</p>
            <p className="mt-2 text-2xl md:text-3xl font-bold text-primary">{monthStats.tradingDays}</p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-4 md:p-6">
            <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Trades</p>
            <p className="mt-2 text-2xl md:text-3xl font-bold text-info">{monthStats.totalTrades}</p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-4 md:p-6">
            <p className="text-xs md:text-sm font-medium text-muted-foreground">Monthly P&L</p>
            <p className={`mt-2 text-2xl md:text-3xl font-bold ${monthStats.totalPnL > 0 ? 'text-success' : 'text-danger'}`}>
              ${monthStats.totalPnL.toFixed(0)}
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-4 md:p-6">
            <p className="text-xs md:text-sm font-medium text-muted-foreground">Win Rate</p>
            <p className="mt-2 text-2xl md:text-3xl font-bold text-success">
              {monthStats.tradingDays > 0 ? ((monthStats.winningDays / monthStats.tradingDays) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border/50 rounded-lg p-4 md:p-6"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{monthName}</h2>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToday}
                className="px-3 py-2 text-xs md:text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                Today
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextMonth}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <motion.div
                className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          ) : (
            <>
              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs md:text-sm font-semibold text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const dateKey = `${currentYear}-${currentMonth}-${day}`;
                  const dayData = tradingDataMap.get(dateKey);
                  const isFutureDate = new Date(currentYear, currentMonth, day) > new Date();

                  return (
                    <motion.div
                      key={day}
                      whileHover={!isFutureDate ? { scale: 1.05 } : undefined}
                      className={`aspect-square rounded-lg border border-border/50 p-2 flex flex-col items-center justify-center text-xs md:text-sm font-medium cursor-pointer transition-all ${
                        isFutureDate
                          ? 'bg-muted/10 text-muted-foreground opacity-50'
                          : dayData
                          ? `${getColor(dayData.pnl)} text-foreground`
                          : 'bg-muted/10 text-muted-foreground hover:bg-muted/20'
                      }`}
                    >
                      {dayData && !isFutureDate ? (
                        <div className="text-center">
                          <div className="font-bold">{day}</div>
                          <div className="text-xs mt-1">
                            {dayData.trades.length} {dayData.trades.length === 1 ? 'trade' : 'trades'}
                          </div>
                          <div className={`text-xs font-bold mt-1 ${dayData.pnl > 0 ? 'text-success' : 'text-danger'}`}>
                            ${dayData.pnl.toFixed(0)}
                          </div>
                        </div>
                      ) : isFutureDate ? (
                        <div className="text-center">
                          <div className="font-bold">{day}</div>
                          <div className="text-xs mt-1">Future</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="font-bold">{day}</div>
                          <div className="text-xs mt-1">No trades</div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border/50 rounded-lg p-4 md:p-6"
        >
          <h3 className="text-sm md:text-base font-bold text-foreground mb-4">Color Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success/80 rounded" />
              <span className="text-xs md:text-sm text-muted-foreground">+100 P&L</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success/60 rounded" />
              <span className="text-xs md:text-sm text-muted-foreground">+50 to +100</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success/40 rounded" />
              <span className="text-xs md:text-sm text-muted-foreground">+0 to +50</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-danger/40 rounded" />
              <span className="text-xs md:text-sm text-muted-foreground">-50 to 0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-danger/60 rounded" />
              <span className="text-xs md:text-sm text-muted-foreground">-100 to -50</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-danger/80 rounded" />
              <span className="text-xs md:text-sm text-muted-foreground">-100 P&L</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/10 rounded" />
              <span className="text-xs md:text-sm text-muted-foreground">No trades</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted/20 rounded" />
              <span className="text-xs md:text-sm text-muted-foreground">Future date</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
