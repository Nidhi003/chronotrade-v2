"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, Save, Edit3, ArrowUpRight, ArrowDownRight,
  DollarSign, Target, Clock, TrendingUp, TrendingDown,
  CheckCircle2, AlertCircle, Tag
} from "lucide-react";

const STRATEGIES = ["Breakout","Pullback","Reversal","Trend Following","Range","Scalp","News","Swing"];
const TIMEFRAMES = ["1m","5m","15m","1h","4h","1d"];

export default function TradeDetailPanel({ trade, onClose, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (trade) {
      setForm({
        symbol: trade.symbol || "",
        side: trade.side || "",
        quantity: trade.quantity || "",
        entry_price: trade.entry_price ?? trade.entryPrice ?? "",
        exit_price: trade.exit_price ?? trade.exitPrice ?? "",
        pnl: trade.pnl ?? "",
        strategy: trade.strategy || "",
        timeframe: trade.timeframe || "",
        confidence: trade.confidence || "",
        notes: trade.notes || "",
        risk_amount: trade.risk_amount ?? trade.riskAmount ?? "",
        swap_fee: trade.swap_fee ?? trade.swapFee ?? "",
        commission: trade.commission ?? "",
      });
      setEditing(false);
    }
  }, [trade]);

  if (!trade) return null;

  const isWin = (trade.pnl || 0) > 0;

  const handleSave = async () => {
    setSaving(true);
    const updates = {
      ...form,
      pnl: parseFloat(form.pnl) || 0,
      quantity: parseFloat(form.quantity) || 0,
      entry_price: parseFloat(form.entry_price) || null,
      exit_price: parseFloat(form.exit_price) || null,
      risk_amount: parseFloat(form.risk_amount) || 0,
      swap_fee: parseFloat(form.swap_fee) || 0,
      commission: parseFloat(form.commission) || 0,
      status: (parseFloat(form.pnl) || 0) >= 0 ? "WIN" : "LOSS",
    };
    await onSave(trade.id, updates);
    setSaving(false);
    setEditing(false);
  };

  const inputClass = "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-300/40";
  const readClass = "text-sm font-semibold text-white";

  const Field = ({ label, field, type = "text", mono = false }) => (
    <div>
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">{label}</div>
      {editing ? (
        <input type={type} step="any" value={form[field] ?? ""} onChange={e => setForm({ ...form, [field]: e.target.value })} className={`${inputClass} ${mono ? "font-mono" : ""}`} />
      ) : (
        <div className={`${readClass} ${mono ? "font-mono" : ""}`}>{form[field] || "—"}</div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 420 }}
        animate={{ x: 0 }}
        exit={{ x: 420 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="trade-detail-panel h-full w-full max-w-[460px] overflow-y-auto border-l border-yellow-200/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#0b0b0b]/95 backdrop-blur-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isWin ? "bg-emerald-500/15 border border-emerald-500/20" : "bg-rose-500/15 border border-rose-500/20"}`}>
              {isWin ? <ArrowUpRight className="h-5 w-5 text-emerald-400" /> : <ArrowDownRight className="h-5 w-5 text-rose-400" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{trade.symbol}</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className={isWin ? "text-emerald-400" : "text-rose-400"}>{trade.side}</span>
                <span>•</span>
                <span>{trade.created_at ? new Date(trade.created_at).toLocaleDateString() : "Recently"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="rounded-xl border border-yellow-200/15 bg-yellow-200/[0.06] p-2.5 text-yellow-200 transition hover:bg-yellow-200/10">
                <Edit3 className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 p-2.5 text-black transition active:scale-95">
                <Save className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5 text-zinc-400 transition hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {/* P&L Hero */}
          <div className={`rounded-[1.4rem] border p-5 ${isWin ? "border-emerald-500/20 bg-emerald-500/[0.06]" : "border-rose-500/20 bg-rose-500/[0.06]"}`}>
            <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">Net P&L</div>
            {editing ? (
              <input type="number" step="0.01" value={form.pnl} onChange={e => setForm({ ...form, pnl: e.target.value })} className="mt-2 w-full bg-transparent text-4xl font-black text-white outline-none" />
            ) : (
              <div className={`mt-2 text-4xl font-black ${isWin ? "text-emerald-300" : "text-rose-300"}`}>
                {(trade.pnl || 0) >= 0 ? "+" : ""}${Math.abs(trade.pnl || 0).toFixed(2)}
              </div>
            )}
            <div className="mt-3 flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${isWin ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                {trade.status || (isWin ? "WIN" : "LOSS")}
              </span>
              {trade.confidence && (
                <span className="rounded-full border border-yellow-200/12 bg-yellow-200/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase text-yellow-100/80">
                  {trade.confidence} confidence
                </span>
              )}
            </div>
          </div>

          {/* Trade Details Grid */}
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Trade Details</div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Symbol" field="symbol" />
              <div>
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Direction</div>
                {editing ? (
                  <div className="flex gap-2">
                    {["LONG","SHORT"].map(s => (
                      <button key={s} onClick={() => setForm({ ...form, side: s })} className={`flex-1 rounded-lg border px-2 py-2 text-xs font-bold transition ${form.side === s ? (s === "LONG" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-rose-500/30 bg-rose-500/10 text-rose-400") : "border-white/8 text-zinc-400"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${form.side === "LONG" ? "text-emerald-400" : "text-rose-400"}`}>
                    {form.side === "LONG" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {form.side}
                  </span>
                )}
              </div>
              <Field label="Entry Price" field="entry_price" type="number" mono />
              <Field label="Exit Price" field="exit_price" type="number" mono />
              <Field label="Quantity" field="quantity" type="number" />
              <Field label="Risk Amount" field="risk_amount" type="number" />
              <Field label="Swap Fee" field="swap_fee" type="number" />
              <Field label="Commission" field="commission" type="number" />
            </div>
          </div>

          {/* Strategy & Setup */}
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Setup & Strategy</div>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Strategy</div>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {STRATEGIES.map(s => (
                      <button key={s} onClick={() => setForm({ ...form, strategy: s })} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${form.strategy === s ? "border-yellow-300/30 bg-yellow-300/10 text-yellow-100" : "border-white/8 text-zinc-400 hover:text-white"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-white">{form.strategy || "—"}</div>
                )}
              </div>
              <div>
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Timeframe</div>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {TIMEFRAMES.map(t => (
                      <button key={t} onClick={() => setForm({ ...form, timeframe: t })} className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${form.timeframe === t ? "border-yellow-300/30 bg-yellow-300/10 text-yellow-100" : "border-white/8 text-zinc-400"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-white">{form.timeframe || "—"}</div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Trade Notes</div>
            {editing ? (
              <textarea rows={5} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="What was the setup? Did you follow rules?" className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-yellow-300/40" />
            ) : (
              <div className="text-sm leading-7 text-zinc-300">{form.notes || <span className="text-zinc-600 italic">No notes recorded</span>}</div>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            {trade.created_at ? new Date(trade.created_at).toLocaleString() : "Recently"}
          </div>

          {editing && (
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.06]">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 py-3 text-sm font-bold text-black transition active:scale-[0.98]">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
