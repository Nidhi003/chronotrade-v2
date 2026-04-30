"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, X, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import localStorageManager from "@/lib/storage";

const POPULAR_PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD", "BTC/USD", "NAS100", "SPX500", "EUR/GBP", "AUD/USD", "USD/CHF"];
const STRATEGIES = ["Breakout", "Pullback", "Reversal", "Trend", "Range", "Scalp", "News", "Swing"];
const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"];

export default function TradeEntryForm({ onClose, onTradeAdded }) {
  const [form, setForm] = useState({
    symbol: "",
    side: "LONG",
    pnl: "",
    riskAmount: "",
    strategy: "",
    timeframe: "1h",
    notes: "",
    confidence: "medium"
  });
  const [saving, setSaving] = useState(false);

  const isValid = form.symbol && form.side && (form.pnl !== "" || form.pnl != 0);

  const handleSubmit = async () => {
    if (!isValid || saving) return;
    setSaving(true);

    const trade = {
      symbol: form.symbol.toUpperCase(),
      side: form.side,
      pnl: parseFloat(form.pnl) || 0,
      risk_amount: form.riskAmount ? parseFloat(form.riskAmount) : null,
      strategy: form.strategy || null,
      timeframe: form.timeframe || null,
      notes: form.notes || null,
      confidence: form.confidence || "medium",
      status: parseFloat(form.pnl) >= 0 ? "WIN" : "LOSS",
      created_at: new Date().toISOString(),
    };

    localStorageManager.incrementTradeCount();
    onTradeAdded?.(trade);
    onClose();
  };

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl rounded-3xl border border-yellow-200/15 bg-[#0c0c0c] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">Quick Log Trade</h2>
          </div>
          <button onClick={onClose} className="rounded-xl bg-white/5 p-2 text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Symbol</label>
              <input
                value={form.symbol}
                onChange={(e) => updateField("symbol", e.target.value.toUpperCase())}
                placeholder="EUR/USD"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-lg font-bold text-white placeholder-zinc-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">P&L ($)</label>
              <input
                type="number"
                value={form.pnl}
                onChange={(e) => updateField("pnl", e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-lg font-bold text-white placeholder-zinc-600"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => updateField("side", "LONG")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold transition ${
                form.side === "LONG" 
                  ? "bg-emerald-500 text-white" 
                  : "border border-white/10 bg-black/40 text-zinc-500 hover:text-emerald-400"
              }`}
            >
              <TrendingUp className="h-5 w-5" /> LONG
            </button>
            <button
              onClick={() => updateField("side", "SHORT")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold transition ${
                form.side === "SHORT" 
                  ? "bg-rose-500 text-white" 
                  : "border border-white/10 bg-black/40 text-zinc-500 hover:text-rose-400"
              }`}
            >
              <TrendingDown className="h-5 w-5" /> SHORT
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Risk $</label>
              <input
                type="number"
                value={form.riskAmount}
                onChange={(e) => updateField("riskAmount", e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Strategy</label>
              <select
                value={form.strategy}
                onChange={(e) => updateField("strategy", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-white"
              >
                <option value="">Select...</option>
                {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Timeframe</label>
              <select
                value={form.timeframe}
                onChange={(e) => updateField("timeframe", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-white"
              >
                {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">Quick Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Setup, entry reason, emotions..."
              rows={2}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-zinc-600 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/8 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 py-4 text-base font-bold text-zinc-400 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || saving}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition ${
              isValid && !saving
                ? "bg-yellow-300 text-black hover:bg-yellow-200"
                : "bg-zinc-700 text-zinc-500"
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            {saving ? "Saving..." : "Save Trade"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}