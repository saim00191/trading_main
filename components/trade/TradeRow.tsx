"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trade } from "@/lib/types";
import { ChevronDown, Trash2 } from "lucide-react";

interface TradeRowProps {
  trade: Trade;
  onDelete?: (id: string) => Promise<void>;
}

export function TradeRow({ trade, onDelete }: TradeRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredNote, setHoveredNote] = useState(false);

  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: string | Date) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (duration: string) => {
    if (!duration) return "N/A";
    const [hours, minutes] = duration.split(":").slice(0, 2);
    return `${hours}h ${minutes}m`;
  };

  const handleDelete = async () => {
    if (!onDelete || !trade.id) return;
    setIsDeleting(true);
    try {
      await onDelete(trade.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Main Row */}
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-b border-border/50 hover:bg-card/50 transition-colors"
      >
        {/* Expand Button */}
        <td className="px-2 md:px-4 py-2 md:py-3">
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-primary hover:bg-primary/10 p-1 rounded transition-colors"
          >
            <ChevronDown size={16} className="md:size-[20px]" />
          </motion.button>
        </td>

        {/* Pair */}
        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold text-foreground">
          {trade.pair}
        </td>

        {/* Side */}
        <td className="px-2 md:px-4 py-2 md:py-3">
          <span
            className={`text-xs md:text-sm font-bold px-2 py-1 rounded ${trade.side === "BUY" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}
          >
            {trade.side}
          </span>
        </td>

        {/* Entry */}
        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-muted-foreground">
          {parseFloat(String(trade.entry || 0)).toFixed(4)}
        </td>

        {/* Exit */}
        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-muted-foreground">
          {parseFloat(String(trade.exit_price || 0)).toFixed(4)}
        </td>

        {/* P&L */}
        <td className="px-2 md:px-4 py-2 md:py-3">
          <span
            className={`text-xs md:text-sm font-bold ${trade.pnl >= 0 ? "text-success" : "text-danger"}`}
          >
            {trade.pnl >= 0 ? "+" : ""}
            {trade.pnl?.toFixed(2)}
          </span>
        </td>

        {/* % */}
        <td className="px-2 md:px-4 py-2 md:py-3">
          <span
            className={`text-xs md:text-sm font-bold ${trade.pnl_percent >= 0 ? "text-success" : "text-danger"}`}
          >
            {trade.pnl_percent >= 0 ? "+" : ""}
            {trade.pnl_percent?.toFixed(2)}%
          </span>
        </td>

        {/* Type */}
        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-muted-foreground">
          {trade.trade_type}
        </td>

        {/* Date */}
        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-muted-foreground">
          {trade.opened_at
            ? new Date(trade.opened_at).toLocaleDateString()
            : ""}
        </td>
        {/* Status */}
        <td className="px-2 md:px-4 py-2 md:py-3">
          <span
            className={`text-xs font-bold px-2 py-1 rounded ${trade.status === "CLOSED" ? "bg-muted text-muted-foreground" : "bg-info/20 text-info"}`}
          >
            {trade.status}
          </span>
        </td>

        {/* Delete */}
        {onDelete && (
          <td className="px-2 md:px-4 py-2 md:py-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-danger hover:bg-danger/10 p-1 rounded transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} className="md:size-[18px]" />
            </button>
          </td>
        )}
      </motion.tr>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border/50 bg-card/30"
          >
            <td colSpan={11} className="px-2 md:px-4 py-3 md:py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 text-xs md:text-sm">
                <div>
                  <p className="text-muted-foreground font-semibold">SL</p>
                  <p className="text-foreground">
                    {parseFloat(String(trade.stop_loss || 0)).toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">TP</p>
                  <p className="text-foreground">
                    {parseFloat(String(trade.take_profit || 0)).toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Size</p>
                  <p className="text-foreground">{trade.position_size}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Risk %</p>
                  <p className="text-foreground">{trade.risk_percent}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">R:R</p>
                  <p className="text-foreground">
                    {trade.risk_reward?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Market</p>
                  <p className="text-foreground">{trade.market}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">
                    Exchange
                  </p>
                  <p className="text-foreground">{trade.exchange}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">
                    Strategy
                  </p>
                  <p className="text-foreground">{trade.strategy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Session</p>
                  <p className="text-foreground">{trade.session}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">
                    Duration
                  </p>
                  <p className="text-foreground">
                    {formatDuration(trade.duration || "")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">
                    Open Time
                  </p>
                  <p className="text-foreground text-xs">
                    {" "}
                    {trade.opened_at
                      ? new Date(trade.opened_at).toLocaleString()
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">
                    Close Time
                  </p>
                  <p className="text-foreground text-xs">
                    {" "}
                    {trade.closed_at
                      ? new Date(trade.closed_at).toLocaleString()
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">
                    Emotion (B/A)
                  </p>
                  <p className="text-foreground">
                    {trade.emotion_before}/{trade.emotion_after}
                  </p>
                </div>
                {trade.tags && trade.tags.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground font-semibold mb-1">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {trade.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {trade.notes && (
                  <div className="md:col-span-2 lg:col-span-3 relative">
                    <p className="text-muted-foreground font-semibold mb-1">
                      Notes
                    </p>
                    <p
                      onMouseEnter={() => setHoveredNote(true)}
                      onMouseLeave={() => setHoveredNote(false)}
                      className="text-foreground text-xs truncate cursor-help"
                    >
                      {trade.notes.length > 50
                        ? trade.notes.substring(0, 50) + "..."
                        : trade.notes}
                    </p>
                    {hoveredNote && trade.notes.length > 50 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full left-0 bg-card border border-border rounded p-2 whitespace-normal max-w-xs text-xs text-foreground shadow-lg z-50 mb-2"
                      >
                        {trade.notes}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}
