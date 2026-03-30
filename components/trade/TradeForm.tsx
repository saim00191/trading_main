'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { Trade } from '@/lib/types';
import { TagSelector } from './TagSelector';
import { toast } from 'sonner';
import { selectUserEmail } from '@/store/UserLoggedInSlice';
import { supabase } from '@/lib/supabaseClient';

interface TradeFormProps {
  onSubmit: (trade: Trade) => Promise<void>;
}


const toUTC = (dateValue?: string | Date): string | undefined => {
  if (!dateValue) return undefined;

  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }

  return new Date(dateValue).toISOString();
};

// Convert UTC → local (for input display)
const toLocalInput = (utcString?: string) => {
  if (!utcString) return '';

  const date = new Date(utcString);
  const offset = date.getTimezoneOffset();

  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export function TradeForm({ onSubmit }: TradeFormProps) {
 
   const userEmail = useSelector(selectUserEmail);
  const [formData, setFormData] = useState<Partial<Trade>>({
    pair: 'EUR/USD',
    side: 'BUY',
    trade_type: 'DAY',
    market: 'FOREX',
    exchange: '',
    status: 'CLOSED',
    session: 'EUROPE',
    strategy: '',
    entry: 0,
    stop_loss: 0,
    take_profit: 0,
    exit_price: 0,
    position_size: 0,
    risk_percent: 0,
    emotion_before: 5,
    emotion_after: 5,
    notes: '',
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

    const calculatePnL = (): { pnl: number; pnl_percent: number } => {
    const { entry = 0, exit_price = 0, position_size = 0, side } = formData;

    if (!entry || !exit_price || !position_size) return { pnl: 0, pnl_percent: 0 };

    const priceChange = exit_price - entry;
    const direction = side === 'BUY' ? 1 : -1;
    const pnl = priceChange * direction * position_size;
    const pnl_percent = (priceChange / entry) * 100 * direction;

    return { pnl: parseFloat(pnl.toFixed(2)), pnl_percent: parseFloat(pnl_percent.toFixed(2)) };
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.pair?.trim()) newErrors.pair = 'Pair is required';
    if (!formData.exchange?.trim()) newErrors.exchange = 'Exchange is required';
    if (!formData.strategy?.trim()) newErrors.strategy = 'Strategy is required';
    if (!formData.opened_at) newErrors.opened_at = 'Open time is required';
    if (!formData.closed_at) newErrors.closed_at = 'Close time is required';
    if (!formData.entry || formData.entry <= 0) newErrors.entry = 'Entry must be > 0';
    if (!formData.exit_price || formData.exit_price <= 0) newErrors.exit_price = 'Exit must be > 0';
    if (!formData.stop_loss || formData.stop_loss <= 0) newErrors.stop_loss = 'SL must be > 0';
    if (!formData.take_profit || formData.take_profit <= 0) newErrors.take_profit = 'TP must be > 0';
    if (!formData.position_size || formData.position_size <= 0) newErrors.position_size = 'Size must be > 0';
    if (!formData.risk_percent || formData.risk_percent <= 0) newErrors.risk_percent = 'Risk must be > 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleChange = <K extends keyof Trade>(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value, type } = e.target;

  // Type assertion ensures TS knows 'name' is a Trade key
  const key = name as K;

  const finalValue: Trade[K] =
    type === 'number'
      ? (parseFloat(value) || 0) as Trade[K]
      : (value as unknown as Trade[K]);

  setFormData((prev) => ({
    ...prev,
    [key]: finalValue,
  }));

  if (errors[key as string]) {
    setErrors((prev) => ({ ...prev, [key as string]: '' }));
  }
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  try {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const isValid = validateForm();

    if (!isValid) {
      toast.error('Please fix the form errors');
      console.error("Validation Errors:", errors);
      return;
    }

    if (!userEmail) {
      toast.error("User not authenticated");
      console.error("Missing user email");
      return;
    }

    setLoading(true);

    /* FETCH USERNAME FROM SUPABASE */
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("username")
      .eq("email", userEmail)
      .single();

    if (userError) {
      console.error("Username fetch error:", userError);
    }

    const username = userData?.username || "Unknown";

    const { pnl, pnl_percent } = calculatePnL();

    const riskReward =
      formData.take_profit &&
      formData.stop_loss &&
      formData.entry &&
      (formData.entry - formData.stop_loss) !== 0
        ? parseFloat(
            (
              (formData.take_profit - formData.entry) /
              (formData.entry - formData.stop_loss)
            ).toFixed(2)
          )
        : 0;

    /* ✅ FIXED TIMEZONE HERE */
    const tradeData: Trade = {
      ...(formData as Trade),

      opened_at: toUTC(formData.opened_at),
      closed_at: toUTC(formData.closed_at),

      useremail: userEmail,
      username: username,

      pnl,
      pnl_percent,
      risk_reward: riskReward,
    };

    console.log("Submitting trade:", tradeData);

    await onSubmit(tradeData);

    toast.success("Trade saved successfully ✅");

    // reset form
    setFormData({
      pair: "EUR/USD",
      side: "BUY",
      trade_type: "DAY",
      market: "FOREX",
      exchange: "",
      status: "CLOSED",
      session: "EUROPE",
      strategy: "",
      entry: 0,
      stop_loss: 0,
      take_profit: 0,
      exit_price: 0,
      position_size: 0,
      risk_percent: 0,
      emotion_before: 5,
      emotion_after: 5,
      notes: "",
      tags: [],
    });

    setErrors({});
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Trade submission error:", error);
      toast.error(error.message || "Something went wrong while saving trade");
    } else {
      console.error("Trade submission error (unknown):", error);
      toast.error("Something went wrong while saving trade");
    }
  } finally {
    setLoading(false);
  }
};

const renderInput = <K extends keyof Trade>(
  name: K,
  label: string,
  type: 'text' | 'number' | 'datetime-local' = 'text'
) => {
  const hasError = !!errors[name as string];
  return (
    <div key={name as string}>
      <label className="block text-xs md:text-sm font-semibold text-foreground mb-1">{label}</label>
      <input
        type={type}
        name={name as string}
        value={(formData[name] as string | number | undefined) ?? ''}
        onChange={handleChange}
        disabled={loading}
        className={`w-full px-2 md:px-3 py-2 bg-input border rounded text-foreground text-sm focus:outline-none focus:ring-1 transition-all ${
          hasError ? 'border-danger/50 focus:ring-danger/30' : 'border-border focus:ring-primary/30'
        }`}
      />
      {hasError && <p className="text-xs text-danger mt-0.5">{errors[name as string]}</p>}
    </div>
  );
};

const renderSelect = <K extends keyof Trade>(name: K, label: string, options: string[]) => {
  const hasError = !!errors[name as string];
  return (
    <div key={name as string}>
      <label className="block text-xs md:text-sm font-semibold text-foreground mb-1">{label}</label>
      <select
        name={name as string}
        value={(formData[name] as string | number | undefined) ?? ''}
        onChange={handleChange}
        disabled={loading}
        className={`w-full px-2 md:px-3 py-2 bg-input border rounded text-foreground text-sm focus:outline-none focus:ring-1 transition-all ${
          hasError ? 'border-danger/50 focus:ring-danger/30' : 'border-border focus:ring-primary/30'
        }`}
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {hasError && <p className="text-xs text-danger mt-0.5">{errors[name as string]}</p>}
    </div>
  );
};
  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 p-3 md:p-6 bg-card border border-border/50 rounded-lg">
      {/* Trade Details */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        <h3 className="text-base md:text-lg font-bold text-foreground">Trade Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {renderSelect('pair', 'Pair', ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'BTC/USD', 'ETH/USD', 'AAPL', 'GOLD', 'OIL'])}
          {renderSelect('side', 'Side', ['BUY', 'SELL'])}
          {renderSelect('status', 'Status', ['OPEN', 'CLOSED'])}
          {renderSelect('trade_type', 'Type', ['SCALP', 'DAY', 'SWING'])}
          {renderSelect('market', 'Market', ['FOREX', 'CRYPTO', 'STOCKS', 'FUTURES'])}
          {renderSelect('session', 'Session', ['ASIA', 'EUROPE', 'NEWYORK'])}
        </div>
      </motion.div>

      {/* Entry & Exit */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        <h3 className="text-base md:text-lg font-bold text-foreground">Entry & Exit</h3>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {renderInput('opened_at', 'Open Time', 'datetime-local')}
          {renderInput('closed_at', 'Close Time', 'datetime-local')}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {renderInput('entry', 'Entry', 'number')}
          {renderInput('exit_price', 'Exit', 'number')}
          {renderInput('stop_loss', 'SL', 'number')}
          {renderInput('take_profit', 'TP', 'number')}
        </div>
      </motion.div>

      {/* Risk */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        <h3 className="text-base md:text-lg font-bold text-foreground">Risk</h3>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {renderInput('position_size', 'Size', 'number')}
          {renderInput('risk_percent', 'Risk %', 'number')}
        </div>
        <div className="p-2 md:p-3 bg-primary/10 border border-primary/20 rounded text-xs md:text-sm">
          R:R = {((formData.take_profit && formData.stop_loss && formData.entry) 
            ? ((formData.take_profit - formData.entry) / (formData.entry - formData.stop_loss)).toFixed(2)
            : '0.00')}
        </div>
      </motion.div>

      {/* Additional */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        <h3 className="text-base md:text-lg font-bold text-foreground">Additional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {renderInput('exchange', 'Exchange')}
          {renderInput('strategy', 'Strategy')}
        </div>
        
        <div>
          <label className="block text-xs md:text-sm font-semibold text-foreground mb-1">Notes ({formData.notes?.length || 0}/250)</label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            disabled={loading}
            maxLength={250}
            rows={2}
            className={`w-full px-2 md:px-3 py-2 bg-input border rounded text-foreground text-sm focus:outline-none focus:ring-1 transition-all resize-none ${
              errors.notes ? 'border-danger/50 focus:ring-danger/30' : 'border-border focus:ring-primary/30'
            }`}
            placeholder="Trade notes..."
          />
        </div>

        <TagSelector tags={formData.tags || []} onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))} maxTags={5} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs md:text-sm font-semibold text-foreground">Before: {formData.emotion_before}/10</label>
            <input type="range" name="emotion_before" min="1" max="10" value={formData.emotion_before || 5} onChange={handleChange} disabled={loading} className="w-full" />
          </div>
          <div>
            <label className="text-xs md:text-sm font-semibold text-foreground">After: {formData.emotion_after}/10</label>
            <input type="range" name="emotion_after" min="1" max="10" value={formData.emotion_after || 5} onChange={handleChange} disabled={loading} className="w-full" />
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="p-2 md:p-4 bg-card border border-border/50 rounded">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">P&L</p>
            <p className={`font-bold ${calculatePnL().pnl >= 0 ? 'text-success' : 'text-danger'}`}>{calculatePnL().pnl.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">%</p>
            <p className={`font-bold ${calculatePnL().pnl_percent >= 0 ? 'text-success' : 'text-danger'}`}>{calculatePnL().pnl_percent.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => console.log("Submit button clicked")}
        className="w-full bg-primary text-primary-foreground py-2 md:py-3 rounded font-semibold hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 text-sm md:text-base"
      >
        {loading ? 'Saving...' : 'Save Trade'}
      </motion.button>
    </form>
  );
}
