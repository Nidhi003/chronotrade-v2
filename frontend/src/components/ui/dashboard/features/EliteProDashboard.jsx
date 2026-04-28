"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  DollarSign,
  Clock,
  BarChart3,
  PieChart,
  Calendar as CalendarIcon,
  Zap,
  Crown,
  Gem,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Award,
  Shield,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#facc15", "#f59e0b", "#fbbf24", "#d97706", "#fde047"];

export default function EliteProDashboard({ trades = [], tier = "elite" }) {
  const isElite = tier === "elite";
  const [selectedDate, setSelectedDate] = useState(null);

  const stats = useMemo(() => {
    if (!trades.length) {
      return {
        totalPnl: 0,
        winRate: 0,
        expectancy: 0,
        currentStreak: 0,
        worstStreak: 0,
        totalTrades: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        bestDay: "-",
        bestSetup: "-",
      };
    }

    const wins = trades.filter(t => (t.pnl || 0) > 0);
    const losses = trades.filter(t => (t.pnl || 0) <= 0);
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winRate = trades.length ? (wins.length / trades.length) * 100 : 0;
    const avgWin = wins.length ? wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0) / losses.length) : 1;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
    const expectancy = wins.length || losses.length ? (wins.reduce((s, t) => s + (t.pnl || 0), 0) + losses.reduce((s, t) => s + (t.pnl || 0), 0)) / trades.length : 0;

    let currentStreak = 0;
    let bestStreak = 0;
    let worstStreak = 0;
    let tempStreak = 0;
    let lossesTemp = 0;
    let maxLosses = 0;
    const sortedTrades = [...trades].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    for (const t of sortedTrades) {
      if ((t.pnl || 0) > 0) {
        tempStreak++;
        lossesTemp = 0;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
        lossesTemp++;
        if (lossesTemp > maxLosses) maxLosses = lossesTemp;
      }
    }
    currentStreak = sortedTrades.findIndex(t => (t.pnl || 0) <= 0) === -1 ? sortedTrades.length : 0;
    worstStreak = maxLosses;

    const dayStats = {};
    trades.forEach(t => {
      const day = new Date(t.created_at).toLocaleDateString("en-US", { weekday: "long" });
      if (!dayStats[day]) dayStats[day] = 0;
      dayStats[day] += t.pnl || 0;
    });
    const bestDay = Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    const setupStats = {};
    trades.forEach(t => {
      const setup = t.strategy || "Other";
      if (!setupStats[setup]) setupStats[setup] = { count: 0, wins: 0 };
      setupStats[setup].count++;
      if ((t.pnl || 0) > 0) setupStats[setup].wins++;
    });
    const bestSetup = Object.entries(setupStats).sort((a, b) => (b[1].wins / b[1].count) - (a[1].wins / a[1].count))[0]?.[0] || "-";

    return {
      totalPnl,
      winRate,
      expectancy,
      currentStreak,
      worstStreak,
      bestStreak,
      totalTrades: trades.length,
      avgWin,
      avgLoss,
      profitFactor,
      bestDay,
      bestSetup,
    };
  }, [trades]);

  const dailyData = useMemo(() => {
    const days = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days[key] = { trades: 0, pnl: 0, day: d.getDate(), month: d.getMonth() };
    }

    trades.forEach(t => {
      const key = new Date(t.created_at).toISOString().split("T")[0];
      if (days[key]) {
        days[key].trades++;
        days[key].pnl += t.pnl || 0;
      }
    });

    return Object.entries(days).map(([date, data]) => ({ date, ...data }));
  }, [trades]);

  const weeklyData = useMemo(() => {
    const weeks = [];
    const today = new Date();
    
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (w * 7 + today.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      let weekPnl = 0;
      let weekTrades = 0;
      
      trades.forEach(t => {
        const tradeDate = new Date(t.created_at);
        if (tradeDate >= weekStart && tradeDate <= weekEnd) {
          weekPnl += t.pnl || 0;
          weekTrades++;
        }
      });
      
      weeks.push({
        week: `Week ${4 - w}`,
        pnl: weekPnl,
        trades: weekTrades,
        startDate: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    
    return weeks;
  }, [trades]);

  const monthlyData = useMemo(() => {
    const months = {};
    const today = new Date();
    
    for (let i = 2; i >= 0; i--) {
      const m = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = m.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months[key] = { pnl: 0, trades: 0, month: m.getMonth(), year: m.getFullYear() };
    }
    
    trades.forEach(t => {
      const tradeDate = new Date(t.created_at);
      const key = tradeDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (months[key]) {
        months[key].pnl += t.pnl || 0;
        months[key].trades++;
      }
    });
    
    return Object.entries(months).map(([name, data]) => ({
      month: name,
      pnl: data.pnl,
      trades: data.trades,
    }));
  }, [trades]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    return trades.filter(t => new Date(t.created_at).toISOString().split("T")[0] === selectedDate);
  }, [trades, selectedDate]);

  const sessionData = useMemo(() => {
    const sessions = {
      Sydney: { start: 22, end: 7, trades: 0, pnl: 0, wins: 0 },
      Tokyo: { start: 0, end: 9, trades: 0, pnl: 0, wins: 0 },
      London: { start: 8, end: 17, trades: 0, pnl: 0, wins: 0 },
      NewYork: { start: 13, end: 22, trades: 0, pnl: 0, wins: 0 },
    };

    trades.forEach(trade => {
      const date = new Date(trade.created_at);
      const hour = date.getUTCHours();

      if (hour >= 22 || hour < 7) {
        sessions.Sydney.trades++;
        sessions.Sydney.pnl += trade.pnl || 0;
        if ((trade.pnl || 0) > 0) sessions.Sydney.wins++;
      } else if (hour >= 0 && hour < 9) {
        sessions.Tokyo.trades++;
        sessions.Tokyo.pnl += trade.pnl || 0;
        if ((trade.pnl || 0) > 0) sessions.Tokyo.wins++;
      } else if (hour >= 8 && hour < 17) {
        sessions.London.trades++;
        sessions.London.pnl += trade.pnl || 0;
        if ((trade.pnl || 0) > 0) sessions.London.wins++;
      } else {
        sessions.NewYork.trades++;
        sessions.NewYork.pnl += trade.pnl || 0;
        if ((trade.pnl || 0) > 0) sessions.NewYork.wins++;
      }
    });

    return Object.entries(sessions).map(([name, data]) => ({
      name,
      trades: data.trades,
      pnl: data.pnl,
      winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
    }));
  }, [trades]);

  const symbolData = useMemo(() => {
    const symbols = {};
    trades.forEach(t => {
      const sym = t.symbol?.replace(/[^A-Z]/g, "") || "OTHER";
      if (!symbols[sym]) symbols[sym] = { count: 0, pnl: 0, wins: 0 };
      symbols[sym].count++;
      symbols[sym].pnl += t.pnl || 0;
      if ((t.pnl || 0) > 0) symbols[sym].wins++;
    });

    return Object.entries(symbols)
      .map(([symbol, data]) => ({
        symbol,
        ...data,
        winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 8);
  }, [trades]);

  const getIntensity = (count) => {
    if (count === 0) return "bg-white/5";
    if (count <= 2) return "bg-yellow-300/20";
    if (count <= 5) return "bg-yellow-300/40";
    if (count <= 8) return "bg-yellow-300/60";
    return "bg-yellow-300/80";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-300" />
            Trading Dashboard
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Calendar view with daily P&L and performance insights</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
          isElite
            ? "bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 text-black"
            : "bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 text-black"
        }`}>
          {isElite ? <Gem className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
          {isElite ? "Elite" : "Pro"} Dashboard
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total P&L"
          value={`$${stats.totalPnl.toLocaleString()}`}
          prefix={stats.totalPnl >= 0 ? "+" : ""}
          icon={DollarSign}
          color={stats.totalPnl >= 0 ? "emerald" : "rose"}
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          icon={Target}
          color={stats.winRate >= 50 ? "yellow" : "rose"}
        />
        <StatCard
          title="Expectancy"
          value={`$${stats.expectancy.toFixed(0)}`}
          prefix={stats.expectancy >= 0 ? "+" : ""}
          icon={Activity}
          color={stats.expectancy >= 0 ? "emerald" : "rose"}
        />
        <StatCard
          title="Profit Factor"
          value={stats.profitFactor.toFixed(2)}
          icon={PieChart}
          color={stats.profitFactor >= 1.5 ? "emerald" : stats.profitFactor >= 1 ? "yellow" : "rose"}
        />
      </div>

      {/* Calendar Heatmap */}
      <div className="rounded-2xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-yellow-300" />
          Trade Calendar - Last 30 Days
        </h3>
        <div className="flex gap-1 flex-wrap">
          {dailyData.map((day, i) => (
            <button
              key={i}
              onClick={() => setSelectedDate(day.trades > 0 ? day.date : null)}
              disabled={day.trades === 0}
              className={`w-8 h-8 rounded-lg ${getIntensity(day.trades)} text-[10px] font-medium flex items-center justify-center transition ${
                selectedDate === day.date ? "ring-2 ring-yellow-300" : ""
              } ${day.trades > 0 ? "cursor-pointer hover:ring-1 hover:ring-white/30" : "cursor-not-allowed opacity-50"}`}
              title={`${day.date}: ${day.trades} trades, $${day.pnl.toFixed(2)}`}
            >
              {day.day}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-8 h-8 rounded-lg bg-white/5" />
            <div className="w-8 h-8 rounded-lg bg-yellow-300/20" />
            <div className="w-8 h-8 rounded-lg bg-yellow-300/40" />
            <div className="w-8 h-8 rounded-lg bg-yellow-300/60" />
            <div className="w-8 h-8 rounded-lg bg-yellow-300/80" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDayData && selectedDayData.length > 0 && (
        <div className="rounded-2xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-yellow-300" />
              {selectedDate} - {selectedDayData.length} Trades
            </h3>
            <button onClick={() => setSelectedDate(null)} className="text-xs text-zinc-500 hover:text-white">
              Close
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedDayData.map((trade, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-300/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-yellow-200">{trade.symbol?.substring(0, 2)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{trade.symbol}</div>
                    <div className="text-xs text-zinc-500">{trade.strategy}</div>
                  </div>
                </div>
                <div className={`text-sm font-bold ${(trade.pnl || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {(trade.pnl || 0) >= 0 ? "+" : ""}${trade.pnl?.toFixed(2) || "0.00"}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Day Total</span>
            <span className={`text-lg font-bold ${selectedDayData.reduce((s, t) => s + (t.pnl || 0), 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {selectedDayData.reduce((s, t) => s + (t.pnl || 0), 0) >= 0 ? "+" : ""}$
              {selectedDayData.reduce((s, t) => s + (t.pnl || 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Weekly & Monthly P&L */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly P&L */}
        <div className="rounded-2xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-yellow-300" />
            Weekly P&L
          </h3>
          <div className="space-y-3">
            {weeklyData.map((week, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div>
                  <div className="text-sm font-semibold text-white">{week.week}</div>
                  <div className="text-xs text-zinc-500">{week.startDate}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${week.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {week.pnl >= 0 ? "+" : ""}${week.pnl.toFixed(2)}
                  </div>
                  <div className="text-xs text-zinc-500">{week.trades} trades</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-zinc-500">This Month</span>
            <span className={`text-lg font-bold ${
              weeklyData[0]?.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}>
              {weeklyData[0]?.pnl >= 0 ? "+" : ""}${weeklyData[0]?.pnl.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        {/* Monthly P&L */}
        <div className="rounded-2xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-yellow-300" />
            Monthly P&L
          </h3>
          <div className="space-y-3">
            {monthlyData.map((month, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-sm font-semibold text-white">{month.month}</div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${month.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {month.pnl >= 0 ? "+" : ""}${month.pnl.toFixed(2)}
                  </div>
                  <div className="text-xs text-zinc-500">{month.trades} trades</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Total</span>
            <span className={`text-lg font-bold ${
              monthlyData.reduce((s, m) => s + m.pnl, 0) >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}>
              {monthlyData.reduce((s, m) => s + m.pnl, 0) >= 0 ? "+" : ""}$
              {monthlyData.reduce((s, m) => s + m.pnl, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Session Performance */}
      <div className="rounded-2xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-300" />
          Session Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sessionData.map((session) => (
            <div key={session.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">{session.name}</div>
              <div className={`text-xl font-black ${session.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {session.pnl >= 0 ? "+" : ""}${session.pnl.toFixed(0)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-500">{session.trades} trades</span>
                <span className={`text-xs font-bold ${session.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                  {session.winRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symbol Performance */}
      <div className="rounded-2xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-yellow-300" />
          Symbol Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {symbolData.slice(0, 8).map((sym) => (
            <div key={sym.symbol} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{sym.symbol}</span>
                <span className={`text-xs font-bold ${sym.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {sym.pnl >= 0 ? "+" : ""}${sym.pnl.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-zinc-500">{sym.count} trades</span>
                <span className={`text-xs font-bold ${sym.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                  {sym.winRate}% WR
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

{/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 text-center">
          <Flame className="h-5 w-5 text-orange-400 mx-auto mb-2" />
          <div className="text-xl font-black text-white">{stats.currentStreak}</div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Current Streak</div>
        </div>
        <div className="rounded-xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 text-center">
          <Award className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
          <div className="text-xl font-black text-white">{stats.bestStreak}</div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Best Streak</div>
        </div>
        <div className="rounded-xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 text-center">
          <Zap className="h-5 w-5 text-yellow-300 mx-auto mb-2" />
          <div className="text-xl font-black text-white">{stats.totalTrades}</div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Trades</div>
        </div>
        <div className="rounded-xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 text-center">
          <Shield className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
          <div className="text-xl font-black text-white">{stats.worstStreak}</div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Worst Streak</div>
        </div>
      </div>

      {/* Best Day & Best Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-yellow-200/10 bg-[linear_gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-yellow-300" />
            Best Day
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div>
              <div className="text-2xl font-bold text-white">{stats.bestDay}</div>
              <div className="text-sm text-zinc-500">Most profitable day</div>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-200/10 bg-[linear_gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-yellow-300" />
            Best Setup
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div>
              <div className="text-2xl font-bold text-white">{stats.bestSetup}</div>
              <div className="text-sm text-zinc-500">Highest win rate</div>
            </div>
            <Award className="h-8 w-8 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Symbol Performance */}
      <div className="rounded-2xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-yellow-300" />
          Symbol Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {symbolData.slice(0, 8).map((sym) => (
            <div key={sym.symbol} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{sym.symbol}</span>
                <span className={`text-xs font-bold ${sym.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {sym.pnl >= 0 ? "+" : ""}${sym.pnl.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-zinc-500">{sym.count} trades</span>
                <span className={`text-xs font-bold ${sym.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                  {sym.winRate}% WR
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly & Monthly P&L */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-yellow-300" />
            Best Day
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div>
              <div className="text-2xl font-bold text-white">{stats.bestDay}</div>
              <div className="text-sm text-zinc-500">Most profitable day</div>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-yellow-300" />
            Best Setup
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div>
              <div className="text-2xl font-bold text-white">{stats.bestSetup}</div>
              <div className="text-sm text-zinc-500">Highest win rate</div>
            </div>
            <Award className="h-8 w-8 text-yellow-300" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, prefix = "", suffix = "", icon: Icon, color = "yellow" }) {
  const colorClasses = {
    yellow: "bg-yellow-300/10 text-yellow-300 border-yellow-300/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="rounded-xl border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</span>
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="text-xl font-black text-white">
        <span className={color === "emerald" ? "text-emerald-400" : color === "rose" ? "text-rose-400" : "text-white"}>
          {prefix}{value}{suffix}
        </span>
      </div>
    </div>
  );
}