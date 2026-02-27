'use client';

import React, { useState } from 'react';
import { AnimatedButton } from '@/components/common/AnimatedButton';
import { Trade } from '@/lib/types';

interface TradeFormProps {
  onSubmit: (trade: Partial<Trade>) => void;
  initialValues?: Partial<Trade>;
}

export function TradeForm({ onSubmit, initialValues }: TradeFormProps) {
  const [formData, setFormData] = useState<Partial<Trade>>(
    initialValues || {
      pair: 'EUR/USD',
      type: 'BUY',
      tradeType: 'DAY',
      strategy: 'MA Crossover',
      session: 'EUROPE',
      emotionBefore: 5,
      emotionAfter: 5,
    }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseFloat(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      onSubmit(formData);
      setLoading(false);
      setFormData({
        pair: 'EUR/USD',
        type: 'BUY',
        tradeType: 'DAY',
        strategy: 'MA Crossover',
        session: 'EUROPE',
        emotionBefore: 5,
        emotionAfter: 5,
      });
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1: Pair, Type, Trade Type */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Currency Pair *</label>
          <select
            name="pair"
            value={formData.pair || ''}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option>EUR/USD</option>
            <option>GBP/USD</option>
            <option>USD/JPY</option>
            <option>AUD/USD</option>
            <option>USD/CAD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
          <select
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Trade Type *</label>
          <select
            name="tradeType"
            value={formData.tradeType || ''}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="SCALP">Scalp</option>
            <option value="DAY">Day Trade</option>
            <option value="SWING">Swing</option>
            <option value="POSITION">Position</option>
          </select>
        </div>
      </div>

      {/* Row 2: Entry, Exit, Stop Loss, Take Profit */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Entry Price *</label>
          <input
            type="number"
            name="entry"
            value={formData.entry || ''}
            onChange={handleChange}
            step="0.0001"
            required
            placeholder="1.0500"
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Exit Price *</label>
          <input
            type="number"
            name="exit"
            value={formData.exit || ''}
            onChange={handleChange}
            step="0.0001"
            required
            placeholder="1.0520"
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Stop Loss *</label>
          <input
            type="number"
            name="stopLoss"
            value={formData.stopLoss || ''}
            onChange={handleChange}
            step="0.0001"
            required
            placeholder="1.0480"
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Take Profit *</label>
          <input
            type="number"
            name="takeProfit"
            value={formData.takeProfit || ''}
            onChange={handleChange}
            step="0.0001"
            required
            placeholder="1.0550"
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Row 3: Position Size, Risk %, Strategy */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Position Size *</label>
          <input
            type="number"
            name="positionSize"
            value={formData.positionSize || ''}
            onChange={handleChange}
            step="0.01"
            required
            placeholder="0.01"
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Risk % *</label>
          <input
            type="number"
            name="riskPercent"
            value={formData.riskPercent || ''}
            onChange={handleChange}
            step="0.01"
            required
            placeholder="2.00"
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Strategy *</label>
          <select
            name="strategy"
            value={formData.strategy || ''}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option>MA Crossover</option>
            <option>Support/Resistance</option>
            <option>Breakout</option>
            <option>Pullback</option>
            <option>Trend Following</option>
          </select>
        </div>
      </div>

      {/* Row 4: Session, Emotion Before, Emotion After */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Session *</label>
          <select
            name="session"
            value={formData.session || ''}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="ASIA">Asia</option>
            <option value="EUROPE">Europe</option>
            <option value="US">US</option>
            <option value="OVERLAP">Overlap</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Emotion Before (1-10)</label>
          <input
            type="range"
            name="emotionBefore"
            value={formData.emotionBefore || 5}
            onChange={handleChange}
            min="1"
            max="10"
            className="w-full"
          />
          <div className="mt-1 text-center text-sm text-muted-foreground">{formData.emotionBefore || 5}/10</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Emotion After (1-10)</label>
          <input
            type="range"
            name="emotionAfter"
            value={formData.emotionAfter || 5}
            onChange={handleChange}
            min="1"
            max="10"
            className="w-full"
          />
          <div className="mt-1 text-center text-sm text-muted-foreground">{formData.emotionAfter || 5}/10</div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
        <textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          placeholder="Trade analysis, reasons, observations..."
          rows={3}
          className="w-full rounded-lg border border-border/50 bg-input px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 justify-end">
        <AnimatedButton type="submit" variant="primary" loading={loading}>
          Save Trade
        </AnimatedButton>
      </div>
    </form>
  );
}
