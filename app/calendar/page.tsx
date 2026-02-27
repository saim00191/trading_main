'use client';

import React, { useMemo } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ChartContainer } from '@/components/common/ChartContainer';
import { mockTrades } from '@/lib/mock-data';

export default function CalendarPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get the first day of the month and the number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Create trading data map
  const tradingDataMap = useMemo(() => {
    const map = new Map<string, { trades: number; pnl: number; wins: number; losses: number }>();

    mockTrades.forEach((trade) => {
      const tradeDate = new Date(trade.date);
      const dateKey = `${tradeDate.getFullYear()}-${tradeDate.getMonth()}-${tradeDate.getDate()}`;

      if (!map.has(dateKey)) {
        map.set(dateKey, { trades: 0, pnl: 0, wins: 0, losses: 0 });
      }

      const data = map.get(dateKey)!;
      data.trades += 1;
      data.pnl += trade.pnl;
      if (trade.pnl > 0) data.wins += 1;
      else if (trade.pnl < 0) data.losses += 1;
    });

    return map;
  }, []);

  const getColor = (pnl: number | undefined) => {
    if (pnl === undefined) return 'bg-muted/10';
    if (pnl > 100) return 'bg-success/80';
    if (pnl > 50) return 'bg-success/60';
    if (pnl > 0) return 'bg-success/40';
    if (pnl > -50) return 'bg-danger/40';
    if (pnl > -100) return 'bg-danger/60';
    return 'bg-danger/80';
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Calculate statistics for the month
  const monthStats = useMemo(() => {
    let totalTrades = 0;
    let totalPnL = 0;
    let tradingDays = 0;
    let wins = 0;
    let losses = 0;

    tradingDataMap.forEach((data) => {
      totalTrades += data.trades;
      totalPnL += data.pnl;
      tradingDays += 1;
      wins += data.wins;
      losses += data.losses;
    });

    return { totalTrades, totalPnL, tradingDays, wins, losses };
  }, [tradingDataMap]);

  return (
    <DashboardLayout title="Trading Calendar" subtitle="View your trading activity and performance">
      {/* Month Overview */}
      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border/50 bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Trading Days</p>
          <p className="mt-2 text-3xl font-bold text-primary">{monthStats.tradingDays}</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Trades</p>
          <p className="mt-2 text-3xl font-bold text-info">{monthStats.totalTrades}</p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Monthly P&L</p>
          <p className={`mt-2 text-3xl font-bold ${monthStats.totalPnL > 0 ? 'text-success' : 'text-danger'}`}>
            ${monthStats.totalPnL.toFixed(0)}
          </p>
        </div>

        <div className="rounded-lg border border-border/50 bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
          <p className="mt-2 text-3xl font-bold text-warning">
            {monthStats.totalTrades > 0 ? ((monthStats.wins / monthStats.totalTrades) * 100).toFixed(0) : 0}%
          </p>
        </div>
      </section>

      {/* Calendar Heatmap */}
      <section className="mb-8">
        <ChartContainer title={`Calendar Heatmap - ${monthName}`} description="Green = profitable day, Red = losing day">
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-success/80" />
                <span className="text-muted-foreground">Highly Profitable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-success/40" />
                <span className="text-muted-foreground">Profitable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-muted/10" />
                <span className="text-muted-foreground">No Trading</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-danger/40" />
                <span className="text-muted-foreground">Loss</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-danger/80" />
                <span className="text-muted-foreground">Major Loss</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Day names */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="h-10 flex items-center justify-center text-sm font-semibold text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} />;
                    }

                    const dateKey = `${currentYear}-${currentMonth}-${day}`;
                    const data = tradingDataMap.get(dateKey);
                    const bgColor = getColor(data?.pnl);

                    return (
                      <div
                        key={day}
                        className={`
                          relative aspect-square rounded-lg border border-border/30 p-2
                          transition-all duration-300 hover:scale-110 hover:shadow-lg
                          ${bgColor} cursor-pointer group
                        `}
                        title={
                          data
                            ? `${day}: ${data.trades} trades, P&L: $${data.pnl.toFixed(0)}, Wins: ${data.wins}, Losses: ${data.losses}`
                            : `${day}: No trading`
                        }
                      >
                        <div className="flex flex-col h-full">
                          <span className="text-xs font-semibold text-foreground">{day}</span>

                          {data && (
                            <div className="flex-1 flex flex-col justify-end text-xs gap-0.5">
                              <span className={data.pnl > 0 ? 'text-success' : 'text-danger'}>
                                ${Math.abs(data.pnl).toFixed(0)}
                              </span>
                              <span className="text-muted-foreground text-[10px]">{data.trades}t</span>
                            </div>
                          )}
                        </div>

                        {/* Tooltip */}
                        {data && (
                          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 rounded-lg bg-card p-2 text-xs text-foreground shadow-lg opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-border/50 z-10">
                            <div className="font-semibold">{day}</div>
                            <div className="text-muted-foreground">{data.trades} trades</div>
                            <div className={data.pnl > 0 ? 'text-success' : 'text-danger'}>
                              ${data.pnl.toFixed(0)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </ChartContainer>
      </section>

      {/* Top Trading Days */}
      <section>
        <ChartContainer title="Best & Worst Trading Days" description="Your top performing days">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Best days */}
            <div>
              <h3 className="mb-3 font-semibold text-foreground">Best Days</h3>
              <div className="space-y-2">
                {Array.from(tradingDataMap.entries())
                  .sort(([, a], [, b]) => b.pnl - a.pnl)
                  .slice(0, 5)
                  .map(([date, data]) => {
                    const [year, month, day] = date.split('-');
                    const displayDate = new Date(parseInt(year), parseInt(month), parseInt(day)).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric' }
                    );

                    return (
                      <div key={date} className="flex items-center justify-between rounded-lg bg-success/10 p-3">
                        <div>
                          <p className="font-medium text-foreground">{displayDate}</p>
                          <p className="text-sm text-muted-foreground">{data.trades} trades</p>
                        </div>
                        <span className="font-bold text-success">${data.pnl.toFixed(0)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Worst days */}
            <div>
              <h3 className="mb-3 font-semibold text-foreground">Worst Days</h3>
              <div className="space-y-2">
                {Array.from(tradingDataMap.entries())
                  .sort(([, a], [, b]) => a.pnl - b.pnl)
                  .slice(0, 5)
                  .map(([date, data]) => {
                    const [year, month, day] = date.split('-');
                    const displayDate = new Date(parseInt(year), parseInt(month), parseInt(day)).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric' }
                    );

                    return (
                      <div key={date} className="flex items-center justify-between rounded-lg bg-danger/10 p-3">
                        <div>
                          <p className="font-medium text-foreground">{displayDate}</p>
                          <p className="text-sm text-muted-foreground">{data.trades} trades</p>
                        </div>
                        <span className="font-bold text-danger">${data.pnl.toFixed(0)}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </ChartContainer>
      </section>
    </DashboardLayout>
  );
}
