"use client";
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Lock,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import localStorageManager from "@/lib/storage";

const POPULAR_PAIRS = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", category: "Majors" },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", category: "Majors" },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", category: "Majors" },
  { symbol: "XAU/USD", name: "Gold / US Dollar", category: "Metals" },
  { symbol: "BTC/USD", name: "Bitcoin / US Dollar", category: "Crypto" },
  { symbol: "NAS100", name: "Nasdaq 100", category: "Indices" },
];

const STRATEGIES = [
  "Breakout",
  "Pullback",
  "Reversal",
  "Trend Following",
  "Range",
  "Scalp",
  "News",
  "Swing",
];

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];

export default function TradeEntryForm({ onClose, onTradeAdded }) {
  const [step, setStep] = useState(1);
  const [limitError, setLimitError] = useState(null);
  const [formData, setFormData] = useState({
    symbol: "",
    side: "",
    quantity: "",
    entryPrice: "",
    exitPrice: "",
    pnl: "",
    riskAmount: "",
    swapFee: "",
    commission: "",
    strategy: "",
    timeframe: "",
    notes: "",
    confidence: "medium",
    accountId: "live",
  });

  const customAccounts = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('chronotrade_accounts')) || [];
    } catch {
      return [];
    }
  }, []);

  const accountOptions = useMemo(() => [
    { id: 'live', name: 'ChronoTradez Live Journal' },
    ...customAccounts
  ], [customAccounts]);

  const filteredPairs = useMemo(() => {
    if (!formData.symbol) return POPULAR_PAIRS;
    const query = formData.symbol.toLowerCase();
    return POPULAR_PAIRS.filter(
      (pair) =>
        pair.symbol.toLowerCase().includes(query) || pair.name.toLowerCase().includes(query)
    );
  }, [formData.symbol]);

  const finalPnl = useMemo(() => {
    const basePnl = parseFloat(formData.pnl) || 0;
    const swap = parseFloat(formData.swapFee) || 0;
    const commission = parseFloat(formData.commission) || 0;
    return basePnl - swap - commission;
  }, [formData.pnl, formData.swapFee, formData.commission]);

  const riskToReward = useMemo(() => {
    const risk = parseFloat(formData.riskAmount) || 0;
    if (!risk) return null;
    return finalPnl / risk;
  }, [finalPnl, formData.riskAmount]);

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.symbol && formData.side;
      case 2:
        return formData.pnl !== "";
      case 3:
        return formData.strategy && formData.timeframe;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const checkTradeLimit = () => {
    const limit = localStorageManager.checkTradeLimit();
    if (!limit.allowed) {
      const daysLeft = Math.ceil((limit.periodEnd - Date.now()) / (24 * 60 * 60 * 1000));
      setLimitError({
        title: "Free trade limit reached",
        message: `You have used ${limit.tradesCount} of 20 monthly trade logs on the free tier.`,
        daysUntilReset: daysLeft,
      });
      return false;
    }
    setLimitError(null);
    return true;
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => prev + 1);
      return;
    }

    if (!checkTradeLimit()) {
      return;
    }

    const trade = {
      symbol: formData.symbol,
      side: formData.side,
      quantity: formData.quantity,
      entryPrice: formData.entryPrice,
      exitPrice: formData.exitPrice,
      pnl: finalPnl,
      riskAmount: formData.riskAmount || 0,
      swapFee: formData.swapFee || 0,
      commission: formData.commission || 0,
      strategy: formData.strategy,
      timeframe: formData.timeframe,
      notes: formData.notes,
      confidence: formData.confidence,
      accountId: formData.accountId,
      id: Date.now(),
      created_at: new Date().toISOString(),
      status: finalPnl >= 0 ? "WIN" : "LOSS",
    };

    localStorageManager.incrementTradeCount();
    onTradeAdded?.(trade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-yellow-200/10 bg-[#0b0b0b] shadow-[0_30px_120px_rgba(0,0,0,0.55)] max-h-[95dvh] flex flex-col"
      >
        <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.12),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200/12 bg-yellow-200/[0.05] px-4 py-2 text-xs uppercase tracking-[0.3em] text-yellow-100/80">
                <Sparkles className="h-4 w-4" />
                New trade
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
                Log the execution while the details are still sharp.
              </h2>
              <p className="mt-2 text-sm leading-7 text-zinc-400">
                Capture symbol, direction, P&amp;L, setup, timeframe, and notes so every trade becomes review material.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-zinc-400 transition hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Instrument", "Result", "Setup", "Review"].map((label, index) => (
              <div
                key={label}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] transition ${
                  step >= index + 1
                    ? "bg-yellow-200 text-black"
                    : "border border-white/8 bg-white/[0.03] text-zinc-500"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {limitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-[1.5rem] border border-rose-500/20 bg-rose-500/10 p-4"
            >
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
                <div>
                  <div className="font-bold text-rose-300">{limitError.title}</div>
                  <p className="mt-1 text-sm text-rose-200/85">{limitError.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-rose-300/70">
                    Resets in {limitError.daysUntilReset} days
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                className="space-y-6"
              >
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Trading instrument
                  </label>
                  <input
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="Search symbol, pair, or market"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition focus:border-yellow-300/35"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPairs.map((pair) => (
                    <button
                      key={pair.symbol}
                      onClick={() => setFormData({ ...formData, symbol: pair.symbol })}
                      className={`rounded-[1.4rem] border p-4 text-left transition ${
                        formData.symbol === pair.symbol
                          ? "border-yellow-300/35 bg-yellow-300/10"
                          : "border-white/8 bg-white/[0.03]"
                      }`}
                    >
                      <div className="text-sm font-bold text-white">{pair.symbol}</div>
                      <div className="mt-1 text-sm text-zinc-400">{pair.name}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-yellow-100/75">
                        {pair.category}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => setFormData({ ...formData, side: "LONG" })}
                    className={`rounded-[1.5rem] border p-5 transition ${
                      formData.side === "LONG"
                        ? "border-emerald-500/35 bg-emerald-500/10"
                        : "border-white/8 bg-white/[0.03]"
                    }`}
                  >
                    <TrendingUp className="h-8 w-8 text-emerald-300" />
                    <div className="mt-4 text-xl font-bold text-white">Long</div>
                    <div className="mt-1 text-sm text-zinc-400">Profit if price rises</div>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, side: "SHORT" })}
                    className={`rounded-[1.5rem] border p-5 transition ${
                      formData.side === "SHORT"
                        ? "border-rose-500/35 bg-rose-500/10"
                        : "border-white/8 bg-white/[0.03]"
                    }`}
                  >
                    <TrendingDown className="h-8 w-8 text-rose-300" />
                    <div className="mt-4 text-xl font-bold text-white">Short</div>
                    <div className="mt-1 text-sm text-zinc-400">Profit if price falls</div>
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Quantity / Position Size
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity (e.g., 0.01)"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition focus:border-yellow-300/35"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                      Entry Price
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.entryPrice}
                      onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition focus:border-yellow-300/35"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                      Exit Price
                    </label>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.exitPrice}
                      onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition focus:border-yellow-300/35"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                      P&L ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pnl}
                      onChange={(e) => setFormData({ ...formData, pnl: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition focus:border-yellow-300/35"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                      Swap Fee ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.swapFee}
                      onChange={(e) => setFormData({ ...formData, swapFee: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition focus:border-yellow-300/35"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                      Commission ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition focus:border-yellow-300/35"
                    />
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-emerald-500/20 bg-emerald-500/10 p-5">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-emerald-300 mb-3">
                    <DollarSign className="h-4 w-4" />
                    Net P&L Calculation
                  </div>
                  <div className="text-3xl font-black text-white">
                    {finalPnl >= 0 ? "+" : ""}${finalPnl.toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    P&L minus fees = Net Result
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Risk Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.riskAmount}
                    onChange={(e) => setFormData({ ...formData, riskAmount: e.target.value })}
                    placeholder="Amount risked on this trade"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition focus:border-yellow-300/35"
                  />
                </div>

                {riskToReward !== null && (
                  <div className="rounded-[1.6rem] border border-yellow-200/15 bg-yellow-200/[0.05] p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-zinc-500 mb-1">Risk to Reward</div>
                    <div className="text-2xl font-bold text-yellow-200">1:{riskToReward.toFixed(2)}</div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                className="space-y-6"
              >
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Strategy
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {STRATEGIES.map((strategy) => (
                      <button
                        key={strategy}
                        onClick={() => setFormData({ ...formData, strategy })}
                        className={`rounded-[1.4rem] border p-4 text-left transition ${
                          formData.strategy === strategy
                            ? "border-yellow-300/35 bg-yellow-300/10"
                            : "border-white/8 bg-white/[0.03]"
                        }`}
                      >
                        <div className="font-semibold text-white">{strategy}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Timeframe
                  </label>
                  <div className="grid gap-3 grid-cols-3 sm:grid-cols-6">
                    {TIMEFRAMES.map((timeframe) => (
                      <button
                        key={timeframe}
                        onClick={() => setFormData({ ...formData, timeframe })}
                        className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                          formData.timeframe === timeframe
                            ? "border-yellow-300/35 bg-yellow-300/10 text-yellow-100"
                            : "border-white/8 bg-white/[0.03] text-zinc-300"
                        }`}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Confidence
                  </label>
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      { id: "low", label: "Low", desc: "Questionable setup" },
                      { id: "medium", label: "Medium", desc: "Reasonable setup" },
                      { id: "high", label: "High", desc: "A+ conviction" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setFormData({ ...formData, confidence: item.id })}
                        className={`rounded-[1.5rem] border p-4 text-left transition ${
                          formData.confidence === item.id
                            ? "border-yellow-300/35 bg-yellow-300/10"
                            : "border-white/8 bg-white/[0.03]"
                        }`}
                      >
                        <div className="font-bold text-white">{item.label}</div>
                        <div className="mt-1 text-sm text-zinc-400">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Account
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {accountOptions.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setFormData({ ...formData, accountId: acc.id })}
                        className={`rounded-[1.4rem] border p-4 text-left transition ${
                          formData.accountId === acc.id
                            ? "border-yellow-300/35 bg-yellow-300/10"
                            : "border-white/8 bg-white/[0.03]"
                        }`}
                      >
                        <div className="font-semibold text-white">{acc.name}</div>
                        <div className="mt-1 text-sm text-zinc-400">{acc.broker || 'Manual'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                className="space-y-6"
              >
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                    Trade notes
                  </label>
                  <textarea
                    rows={5}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="What was the setup? Did you follow your rules? What emotion influenced the trade? What should you repeat or avoid next time?"
                    className="w-full rounded-[1.6rem] border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition focus:border-yellow-300/35"
                  />
                </div>

                <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-zinc-500">
                    <CheckCircle2 className="h-4 w-4 text-yellow-200" />
                    Trade summary
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      ["Instrument", formData.symbol || "-"],
                      ["Direction", formData.side || "-"],
                      ["Strategy", formData.strategy || "-"],
                      ["Timeframe", formData.timeframe || "-"],
                      ["Quantity", formData.quantity || "-"],
                      ["Net P&L", `${finalPnl >= 0 ? "+" : ""}$${finalPnl.toFixed(2)}`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/8 bg-black/25 p-4">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{label}</div>
                        <div className="mt-2 text-lg font-bold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-yellow-200/12 bg-yellow-200/[0.05] p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-200" />
                    <p className="text-sm leading-7 text-zinc-300">
                      High-quality notes make AI review and session analysis more useful. Capture what you saw, how you felt, and whether you respected the plan.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-white/8 bg-white/[0.02] p-6">
          <button
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] transition ${
              step === 1
                ? "cursor-not-allowed text-zinc-700"
                : "border border-white/8 bg-white/[0.03] text-zinc-300"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="text-xs uppercase tracking-[0.26em] text-zinc-500">Step {step} of 4</div>

          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.22em] transition ${
              isStepValid()
                ? "bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 text-black"
                : "cursor-not-allowed bg-zinc-800 text-zinc-600"
            }`}
          >
            {step === 4 ? "Save Trade" : "Next"}
            {step === 4 ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
