'use client';


import { ArrowUp, ArrowDown } from 'lucide-react';

export interface TradeUI {
  id?: string;
  date: string | Date;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  exit: number | null;
  riskRewardRatio: number;
  pnl: number;
  status: 'OPEN' | 'CLOSED';
}

interface TradeTableProps {
  trades: TradeUI[];
  className?: string;
  animated?: boolean;
}

export function TradeTable({
  trades,
  className = '',
  animated = true
}: TradeTableProps) {

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPnlColor = (pnl: number) => {
    if (pnl > 0) return 'text-success';
    if (pnl < 0) return 'text-danger';
    return 'text-muted-foreground';
  };

  const getStatusColor = (status: TradeUI['status']) => {
    switch (status) {
      case 'CLOSED':
        return 'bg-success/10 text-success';
      case 'OPEN':
        return 'bg-info/10 text-info';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div
      className={`
        rounded-lg border border-border/50 bg-card overflow-hidden
        ${animated ? 'animate-fade-in' : ''}
        ${className}
      `}
    >
      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="border-b border-border/50 bg-muted/30">
            <tr>

              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                Date
              </th>

              <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">
                Pair
              </th>

              <th className="px-6 py-3 text-center text-sm font-semibold text-muted-foreground">
                Type
              </th>

              <th className="px-6 py-3 text-right text-sm font-semibold text-muted-foreground">
                Entry
              </th>

              <th className="px-6 py-3 text-right text-sm font-semibold text-muted-foreground">
                Exit
              </th>

              <th className="px-6 py-3 text-right text-sm font-semibold text-muted-foreground">
                R:R
              </th>

              <th className="px-6 py-3 text-right text-sm font-semibold text-muted-foreground">
                PnL
              </th>

              <th className="px-6 py-3 text-center text-sm font-semibold text-muted-foreground">
                Status
              </th>

            </tr>
          </thead>

          <tbody>

            {trades.map((trade, index) => (

              <tr
                key={trade.id ?? index}
                className={`
                  border-b border-border/30 transition-colors hover:bg-muted/10
                  stagger-item
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >

                <td className="px-6 py-4 text-sm text-foreground">
                  {formatDate(trade.date)}
                </td>

                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {trade.pair}
                </td>

                <td className="px-6 py-4 text-center">

                  <div className="flex items-center justify-center gap-1">

                    {trade.type === 'BUY' ? (
                      <ArrowUp size={16} className="text-success" />
                    ) : (
                      <ArrowDown size={16} className="text-danger" />
                    )}

                    <span className="text-sm font-medium">
                      {trade.type}
                    </span>

                  </div>

                </td>

                <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                  {trade.entry.toFixed(4)}
                </td>

                <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                  {trade.exit !== null ? trade.exit.toFixed(4) : '-'}
                </td>

                <td className="px-6 py-4 text-right text-sm text-foreground font-medium">
                  {trade.riskRewardRatio.toFixed(2)}
                </td>

                <td
                  className={`px-6 py-4 text-right text-sm font-semibold ${getPnlColor(trade.pnl)}`}
                >
                  ${trade.pnl.toFixed(2)}
                </td>

                <td className="px-6 py-4 text-center">

                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(trade.status)}`}
                  >
                    {trade.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {trades.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No trades to display
          </p>
        </div>
      )}

    </div>
  );
}