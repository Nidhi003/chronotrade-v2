"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Award,
  Bell,
  CheckCircle2,
  Clock,
  Minus,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import localStorageManager, { loadTradesWithFallback } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

const NOTIFICATION_TYPES = {
  STREAK_WARNING: {
    icon: AlertTriangle,
    tone: "amber",
    label: "Discipline",
  },
  WIN_RATE_CHANGE: {
    icon: TrendingDown,
    tone: "rose",
    label: "Performance",
  },
  LARGE_LOSS: {
    icon: TrendingDown,
    tone: "rose",
    label: "Risk",
  },
  LARGE_WIN: {
    icon: TrendingUp,
    tone: "emerald",
    label: "Execution",
  },
  JOURNAL_REMINDER: {
    icon: Clock,
    tone: "amber",
    label: "Review",
  },
  STREAK_ACHIEVED: {
    icon: Award,
    tone: "emerald",
    label: "Momentum",
  },
  DRAWDOWN_ALERT: {
    icon: Minus,
    tone: "rose",
    label: "Drawdown",
  },
};

const toneClasses = {
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  sky: "border-sky-400/20 bg-sky-400/10 text-sky-200",
};

const priorityOrder = { high: 0, medium: 1, low: 2 };

function getTradeTimestamp(trade) {
  return trade?.entryDate || trade?.created_at || trade?.date || new Date().toISOString();
}

function calculateWinRate(trades) {
  if (!trades.length) return 0;
  const wins = trades.filter((trade) => Number(trade.pnl || 0) > 0).length;
  return (wins / trades.length) * 100;
}

function calculateStreak(trades, direction) {
  let streak = 0;
  for (const trade of trades) {
    const pnl = Number(trade.pnl || 0);
    if ((direction === "win" && pnl > 0) || (direction === "loss" && pnl < 0)) streak += 1;
    else break;
  }
  return streak;
}

function generateNotifications(trades = null) {
  const tradesData = trades || localStorageManager.getTrades();
  const journalEntries = localStorageManager.getJournalEntries ? localStorageManager.getJournalEntries() : [];
  const alerts = [];
  const now = new Date();

  if (!tradesData || tradesData.length === 0) {
    alerts.push({
      id: `welcome_${Date.now()}`,
      type: "JOURNAL_REMINDER",
      title: "Start logging your trades",
      message: "Your first logged trade unlocks performance tracking, streak alerts, and risk insights.",
      priority: "low",
      timestamp: now.toISOString(),
    });
    return alerts;
  }

  const sortedTrades = [...tradesData].sort((a, b) => new Date(getTradeTimestamp(b)) - new Date(getTradeTimestamp(a)));
  const recentTrades = sortedTrades.slice(0, 12);
  const winningStreak = calculateStreak(recentTrades, "win");
  const losingStreak = calculateStreak(recentTrades, "loss");

  if (losingStreak >= 3) {
    alerts.push({
      id: `streak_loss_${Date.now()}`,
      type: "STREAK_WARNING",
      title: `${losingStreak} losses in a row`,
      message: "Stand down and review whether the leak is sizing, timing, or emotional drift before taking the next trade.",
      priority: losingStreak >= 5 ? "high" : "medium",
      timestamp: now.toISOString(),
    });
  }

  if (winningStreak >= 4) {
    alerts.push({
      id: `streak_win_${Date.now()}`,
      type: "STREAK_ACHIEVED",
      title: `${winningStreak} trade win streak`,
      message: "Capture the conditions behind the streak now, while the setup quality and execution pattern are still fresh.",
      priority: "low",
      timestamp: now.toISOString(),
    });
  }

  if (recentTrades[0]) {
    const lastTrade = recentTrades[0];
    const pnl = Number(lastTrade.pnl || 0);
    if (pnl <= -100) {
      alerts.push({
        id: `loss_${Date.now()}`,
        type: "LARGE_LOSS",
        title: `₹${Math.abs(pnl).toFixed(2)} loss booked`,
        message: pnl <= -500
          ? "This loss is large relative to a normal journal event. Review thesis quality and position size before continuing."
          : "Journal the setup failure while it is still precise.",
        priority: pnl <= -500 ? "high" : "medium",
        timestamp: getTradeTimestamp(lastTrade),
      });
    }

    if (pnl >= 200) {
      alerts.push({
        id: `win_${Date.now()}`,
        type: "LARGE_WIN",
        title: `₹${pnl.toFixed(2)} winner closed`,
        message: "Log what made this trade work so the edge is reviewable rather than anecdotal.",
        priority: "low",
        timestamp: getTradeTimestamp(lastTrade),
      });
    }
  }

  const baselineWinRate = calculateWinRate(tradesData);
  const recentWinRate = calculateWinRate(recentTrades);
  if (tradesData.length >= 10 && recentWinRate < baselineWinRate - 10) {
    alerts.push({
      id: `winrate_${Date.now()}`,
      type: "WIN_RATE_CHANGE",
      title: "Recent win rate is slipping",
      message: `Recent sample is ${recentWinRate.toFixed(0)}% versus a broader ${baselineWinRate.toFixed(0)}%. Review setup selection before scaling back up.`,
      priority: "high",
      timestamp: now.toISOString(),
    });
  }

  const losingTrades = tradesData.filter((trade) => Number(trade.pnl || 0) < 0);
  const cumulativePnl = tradesData.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
  const worstLoss = losingTrades.length ? Math.min(...losingTrades.map((trade) => Number(trade.pnl || 0))) : 0;
  const capitalBase = Math.max(250, Math.abs(cumulativePnl));
  const drawdownPct = Math.abs(worstLoss) / capitalBase * 100;
  if (tradesData.length >= 5 && drawdownPct >= 20) {
    alerts.push({
      id: `drawdown_${Date.now()}`,
      type: "DRAWDOWN_ALERT",
      title: `${drawdownPct.toFixed(0)}% stress signal`,
      message: "The loss profile is wide relative to recent PnL. Reduce size until process quality stabilizes.",
      priority: "high",
      timestamp: now.toISOString(),
    });
  }

  const lastJournalTimestamp = journalEntries.length
    ? Math.max(...journalEntries.map((entry) => new Date(entry.date || entry.createdAt || entry.timestamp || now).getTime()))
    : null;

  if (!lastJournalTimestamp || now.getTime() - lastJournalTimestamp > 48 * 60 * 60 * 1000) {
    alerts.push({
      id: `journal_${Date.now()}`,
      type: "JOURNAL_REMINDER",
      title: "Journal review is stale",
      message: "Two quiet days without a review usually means insight is being left on the table. Record what the market and your execution are doing.",
      priority: "medium",
      timestamp: now.toISOString(),
    });
  }

  return alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function NotificationsPanel({ isOpen, onClose, theme = "dark", user }) {
  const [notifications, setNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);
  const [realtimeTrades, setRealtimeTrades] = useState([]);
  const isDark = theme === "dark";

  const loadTradesAndGenerate = async () => {
    if (!user) {
      const trades = await loadTradesWithFallback();
      setRealtimeTrades(trades);
      setNotifications(generateNotifications(trades));
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const trades = await loadTradesWithFallback();
      setRealtimeTrades(trades);
      setNotifications(generateNotifications(trades));
      return;
    }

    const { data: trades, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && trades) {
      setRealtimeTrades(trades);
      setNotifications(generateNotifications(trades));
    } else {
      const trades = await loadTradesWithFallback();
      setRealtimeTrades(trades);
      setNotifications(generateNotifications(trades));
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    loadTradesAndGenerate();

    const channel = supabase
      .channel('notifications-trades-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trades' },
        () => {
          loadTradesAndGenerate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, user]);

  const unreadCount = notifications.length;
  const highPriorityCount = notifications.filter((notification) => notification.priority === "high").length;
  const summary = useMemo(() => {
    if (!notifications.length) {
      return "No active review alerts right now.";
    }
    if (highPriorityCount > 0) {
      return `${highPriorityCount} high-priority items need attention before your next trading session.`;
    }
    return "The desk is clear, but there are still review cues worth processing.";
  }, [highPriorityCount, notifications.length]);

  const markAsRead = (id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications([]);
    setLastChecked(new Date().toISOString());
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`notifications-panel absolute right-0 top-full z-[100] mt-3 w-[24rem] overflow-hidden rounded-[1.75rem] border backdrop-blur-xl ${
        isDark ? "border-yellow-200/10 bg-[#070707]/95 text-white" : "border-slate-200 bg-white text-slate-900"
      } shadow-[0_30px_90px_rgba(0,0,0,0.45)]`}
    >
      <div className="relative overflow-hidden border-b border-white/8 px-4 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_38%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-yellow-200" />
              <div className="text-sm font-bold">Desk alerts</div>
              {unreadCount > 0 && (
                <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-[10px] font-black text-black">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs leading-6 text-zinc-400">{summary}</p>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition hover:bg-white/[0.06]"
            >
              <X className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-white/8 px-4 py-3 text-center">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Unread</div>
          <div className="mt-1 text-sm font-bold text-white">{unreadCount}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Critical</div>
          <div className="mt-1 text-sm font-bold text-white">{highPriorityCount}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Last check</div>
          <div className="mt-1 text-sm font-bold text-white">{lastChecked ? getTimeAgo(lastChecked) : "Now"}</div>
        </div>
      </div>

      <div className="max-h-[28rem] overflow-y-auto p-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
            <div className="rounded-full bg-emerald-400/12 p-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            </div>
            <div className="mt-4 text-base font-semibold text-white">All clear</div>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              No active alerts are blocking the desk. Keep logging and reviewing with the same discipline.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notification) => {
              const meta = NOTIFICATION_TYPES[notification.type] || { icon: Zap, tone: "amber", label: "Alert" };
              const Icon = meta.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="mb-3 rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4 last:mb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-2xl border p-3 ${toneClasses[meta.tone]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-white">{notification.title}</div>
                        <span className="rounded-full border border-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                          {meta.label}
                        </span>
                        {notification.priority === "high" && (
                          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-rose-300">
                            High
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-zinc-300">{notification.message}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{getTimeAgo(notification.timestamp)}</span>
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
