"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Clock,
  DollarSign,
  RefreshCw,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyzeTradePatterns, calculateMetrics } from "@/lib/analytics";

export default function AdvancedAnalytics({ trades }) {
  const [metrics, setMetrics] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!trades?.length) {
      setLoading(false);
      return;
    }

    setMetrics(calculateMetrics(trades));
    setLoading(false);
    loadPatterns();
  }, [trades]);

  async function loadPatterns() {
    try {
      const result = await analyzeTradePatterns(trades);
      if (result) setPatterns(result);
    } catch (e) {
      console.error(e);
    }
  }

  if (!trades?.length) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-[1.9rem] border border-white/8 bg-white/[0.03]">
        <BarChart3 className="h-16 w-16 text-zinc-600" />
        <h3 className="mt-5 text-2xl font-bold text-white">No analytics yet</h3>
        <p className="mt-2 text-zinc-500">Log trades to unlock performance review.</p>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "strategy", label: "Strategy", icon: Target },
    { id: "timing", label: "Timing", icon: Clock },
    { id: "patterns", label: "Patterns", icon: Activity },
  ];

  const metricCards = metrics
    ? [
        { label: "Win Rate", value: `${metrics.winRate}%`, icon: Target },
        { label: "Profit Factor", value: metrics.profitFactor, icon: TrendingUp },
        { label: "Expectancy", value: `$${metrics.expectancy}`, icon: Activity },
        { label: "Total P&L", value: `$${metrics.totalPnl}`, icon: DollarSign },
      ]
    : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Advanced Analytics</h2>
          <p className="text-zinc-500">Session, strategy, timing, and pattern-level review</p>
        </div>
        <button
          onClick={loadPatterns}
          disabled={loading}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
        >
          <RefreshCw className={`h-5 w-5 text-yellow-200 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] transition ${
              tab === tabItem.id
                ? "bg-yellow-200 text-black"
                : "border border-white/8 bg-white/[0.03] text-zinc-400"
            }`}
          >
            <tabItem.icon className="h-4 w-4" />
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "overview" && metrics && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {metricCards.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-300/10">
                  <item.icon className="h-5 w-5 text-yellow-200" />
                </div>
                <div className="mt-4 text-xs uppercase tracking-[0.22em] text-zinc-500">{item.label}</div>
                <div className="mt-2 text-3xl font-black tracking-[-0.03em] text-white">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6">
              <h3 className="text-lg font-bold text-white">P&amp;L by strategy</h3>
              <div className="mt-5 h-72 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <BarChart data={metrics.byStrategy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0b0b0b",
                        border: "1px solid rgba(253,224,71,0.12)",
                        borderRadius: 12,
                      }}
                    />
                    <Bar dataKey="pnl" fill="#fde047" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6">
              <h3 className="text-lg font-bold text-white">Strategy readout</h3>
              <div className="mt-5 space-y-4">
                {metrics.byStrategy.map((strategy) => (
                  <div key={strategy.name} className="rounded-[1.2rem] border border-white/8 bg-black/25 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white">{strategy.name}</div>
                      <div className="text-sm font-bold text-yellow-100">{strategy.winRate}%</div>
                    </div>
                    <div className="mt-2 text-sm text-zinc-400">
                      {strategy.wins} wins / {strategy.losses} losses
                    </div>
                    <div className="mt-3 text-sm font-semibold text-emerald-300">${strategy.pnl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "timing" && metrics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6">
            <h3 className="text-lg font-bold text-white">Time of day analysis</h3>
            <div className="mt-5 space-y-4">
              {metrics.byTime.map((item) => (
                <div key={item.name} className="rounded-[1.2rem] border border-white/8 bg-black/25 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-sm font-bold text-yellow-100">{item.winRate}%</div>
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    {item.wins} wins / {item.losses} losses
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6">
            <h3 className="text-lg font-bold text-white">Day of week analysis</h3>
            <div className="mt-5 space-y-4">
              {metrics.byDay.map((item) => (
                <div key={item.name} className="rounded-[1.2rem] border border-white/8 bg-black/25 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-sm font-bold text-yellow-100">{item.winRate}%</div>
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    {item.wins} wins / {item.losses} losses
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "patterns" && patterns && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.8rem] border border-rose-500/12 bg-rose-500/8 p-6">
            <h3 className="text-lg font-bold text-rose-300">Detected patterns</h3>
            <div className="mt-5 space-y-4">
              {patterns.patterns?.map((pattern, index) => (
                <div key={`${pattern.type}-${index}`} className="rounded-[1.2rem] border border-rose-500/15 bg-black/25 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white">{pattern.type}</div>
                    <div className="rounded-full bg-rose-500/12 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-rose-300">
                      {pattern.severity}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">{pattern.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-yellow-200/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-bold text-white">Recommendations</h3>
            <div className="mt-5 space-y-4">
              {patterns.recommendations?.map((recommendation, index) => (
                <div key={`${recommendation.action}-${index}`} className="rounded-[1.2rem] border border-white/8 bg-black/25 p-4">
                  <div className="font-semibold text-white">{recommendation.action}</div>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">{recommendation.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "strategy" && metrics && (
        <div className="grid gap-6 lg:grid-cols-2">
          {metrics.byStrategy.map((strategy) => (
            <div key={strategy.name} className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-white">{strategy.name}</div>
                <div className="text-3xl font-black text-yellow-100">{strategy.winRate}%</div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                  <div className="text-2xl font-black text-white">{strategy.wins}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">Wins</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                  <div className="text-2xl font-black text-white">{strategy.losses}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">Losses</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
                  <div className="text-2xl font-black text-white">${strategy.pnl}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">P&amp;L</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
