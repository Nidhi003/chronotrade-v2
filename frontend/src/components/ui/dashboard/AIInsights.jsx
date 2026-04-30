"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Wifi,
  ZapOff,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { askOllama, getAIInsights } from "@/lib/ollama";

const FALLBACK_DATA = {
  leaks: [
    { title: "Revenge cluster", description: "Position size expands after losses on high-volatility sessions.", severity: "high", impact: "-$200/week" },
    { title: "Early winner exits", description: "Trades close before the planned target on otherwise valid setups.", severity: "medium", impact: "-$80/week" },
    { title: "Friday overtrading", description: "Trade count rises while quality drops late in the week.", severity: "medium", impact: "-$120/week" },
  ],
  strengths: [
    { title: "Strong morning discipline", description: "Best trade quality between 8 AM and 11 AM." },
    { title: "Breakout edge", description: "Breakout setups hold the highest win rate in the sample." },
    { title: "Solid risk control", description: "Losses remain contained compared with average winner size." },
  ],
  radar: { discipline: 78, riskMgmt: 85, execution: 72, patience: 66, emotional: 74 },
  actions: [
    { title: "Cooldown after losses", desc: "Take a structured pause after any full-risk loss.", action: "Set 30-minute rule" },
    { title: "Hold to plan", desc: "Let winning trades reach planned management levels.", action: "Predefine exits" },
    { title: "Cut Friday exposure", desc: "Reduce afternoon trading on Fridays.", action: "Restrict session hours" },
  ],
};

const FALLBACK_INSIGHT =
  "Your best trades cluster in disciplined morning sessions, while your biggest leak appears after losses when trade frequency rises and process quality falls.";

export default function AIInsights() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiStatus, setAiStatus] = useState("checking");
  const [aiData, setAiData] = useState(null);
  const [quickInsight, setQuickInsight] = useState("");

  const mockTrades = [
    { id: 1, symbol: "EUR/USD", side: "LONG", pnl: 450, status: "WIN", strategy: "Breakout" },
    { id: 2, symbol: "GBP/JPY", side: "SHORT", pnl: -120, status: "LOSS", strategy: "Reversal" },
    { id: 3, symbol: "BTC/USD", side: "LONG", pnl: 890, status: "WIN", strategy: "Scalp" },
    { id: 4, symbol: "NAS100", side: "SHORT", pnl: 320, status: "WIN", strategy: "Breakout" },
    { id: 5, symbol: "XAU/USD", side: "LONG", pnl: -250, status: "LOSS", strategy: "Pullback" },
  ];

  const radarData = aiData?.radar
    ? [
        { subject: "Discipline", value: aiData.radar.discipline, fullMark: 100 },
        { subject: "Risk Mgmt", value: aiData.radar.riskMgmt, fullMark: 100 },
        { subject: "Execution", value: aiData.radar.execution, fullMark: 100 },
        { subject: "Patience", value: aiData.radar.patience, fullMark: 100 },
        { subject: "Emotional", value: aiData.radar.emotional, fullMark: 100 },
      ]
    : [];

  useEffect(() => {
    loadAI();
  }, []);

  async function checkOllamaConnection() {
    try {
      const response = await fetch("http://localhost:11434/api/tags");
      if (response.ok) {
        setAiStatus("connected");
        return true;
      }
    } catch (e) {
      console.log("Ollama unavailable");
    }
    setAiStatus("disconnected");
    return false;
  }

  async function loadAI() {
    setLoading(true);
    setRefreshing(true);
    const connected = await checkOllamaConnection();

    try {
      if (connected) {
        const insight = await askOllama(
          "Give me one concise but useful trading insight based on these trades: EUR/USD WIN +450, GBP/JPY LOSS -120, BTC/USD WIN +890, NAS100 WIN +320, XAU/USD LOSS -250.",
          "You are a concise trading performance coach. Focus on discipline and behavior."
        );
        setQuickInsight(insight);

        const analysis = await getAIInsights(mockTrades);
        setAiData(analysis || FALLBACK_DATA);
      } else {
        setQuickInsight(FALLBACK_INSIGHT);
        setAiData(FALLBACK_DATA);
      }
    } catch (e) {
      console.error(e);
      setQuickInsight(FALLBACK_INSIGHT);
      setAiData(FALLBACK_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-white">
            <Brain className="h-6 w-6 text-yellow-200" />
            AI Oracle
          </h2>
          <p className="text-zinc-500">Behavioral analysis, leak detection, and corrective actions</p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] ${
              aiStatus === "connected"
                ? "bg-emerald-500/12 text-emerald-300"
                : aiStatus === "disconnected"
                  ? "bg-yellow-300/12 text-yellow-200"
                  : "bg-white/[0.04] text-zinc-500"
            }`}
          >
            {aiStatus === "checking" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : aiStatus === "connected" ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <ZapOff className="h-4 w-4" />
            )}
            {aiStatus === "connected" ? "AI Connected" : aiStatus === "disconnected" ? "Demo Mode" : "Checking"}
          </div>

          <button
            onClick={loadAI}
            disabled={refreshing}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
          >
            <RefreshCw className={`h-5 w-5 text-yellow-200 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="rounded-[1.8rem] border border-yellow-200/10 bg-gradient-to-br from-yellow-300/[0.08] via-white/[0.03] to-transparent p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300/10">
            <Sparkles className="h-6 w-6 text-yellow-200" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Quick insight</div>
            <p className="mt-3 text-lg leading-8 text-zinc-200">
              {loading ? "Analyzing your trade history..." : quickInsight}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-[1.8rem] border border-white/8 bg-white/[0.03]">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-yellow-300 border-t-transparent" />
            <p className="mt-4 text-sm uppercase tracking-[0.26em] text-zinc-500">Reading your patterns</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6">
              <h3 className="text-lg font-bold text-white">Performance radar</h3>
              <p className="mt-2 text-sm text-zinc-500">A quick view of the behavior profile behind your results</p>
              <div className="mt-6 h-72 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.12)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
                    <Radar dataKey="value" stroke="#fde047" fill="#fde047" fillOpacity={0.24} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0b0b0b",
                        border: "1px solid rgba(253,224,71,0.12)",
                        borderRadius: 12,
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[1.8rem] border border-rose-500/12 bg-rose-500/8 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-rose-300">
                  <AlertTriangle className="h-5 w-5" />
                  Money leaks
                </h3>
                <div className="mt-5 space-y-4">
                  {aiData?.leaks?.map((leak) => (
                    <div key={leak.title} className="rounded-[1.2rem] border border-rose-500/15 bg-black/25 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-white">{leak.title}</div>
                        <div className="rounded-full bg-rose-500/12 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-rose-300">
                          {leak.severity}
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-zinc-300">{leak.description}</p>
                      <div className="mt-3 text-xs uppercase tracking-[0.22em] text-rose-300/80">
                        {leak.impact} potential savings
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-emerald-500/12 bg-emerald-500/8 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                  Strengths
                </h3>
                <div className="mt-5 space-y-4">
                  {aiData?.strengths?.map((strength) => (
                    <div key={strength.title} className="rounded-[1.2rem] border border-emerald-500/15 bg-black/25 p-4">
                      <div className="font-semibold text-white">{strength.title}</div>
                      <p className="mt-2 text-sm leading-7 text-zinc-300">{strength.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Target className="h-5 w-5 text-yellow-200" />
              Recommended actions
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {aiData?.actions?.map((action) => (
                <div key={action.title} className="rounded-[1.3rem] border border-white/8 bg-black/25 p-4">
                  <div className="font-semibold text-white">{action.title}</div>
                  <p className="mt-2 text-sm leading-7 text-zinc-300">{action.desc}</p>
                  <div className="mt-3 text-xs uppercase tracking-[0.22em] text-yellow-100/80">{action.action}</div>
                </div>
              ))}
            </div>
          </div>

          {aiStatus === "disconnected" && (
            <div className="rounded-[1.6rem] border border-yellow-200/12 bg-yellow-200/[0.05] p-4">
              <div className="flex items-start gap-3">
                <ZapOff className="mt-0.5 h-5 w-5 text-yellow-200" />
                <div>
                  <div className="font-semibold text-yellow-100">Demo mode active</div>
                  <p className="mt-1 text-sm leading-7 text-zinc-300">
                    Connect Ollama locally to unlock live AI review. The panel is currently showing fallback example insights.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
