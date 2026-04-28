"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sunrise, Sun, Sunset, Moon, TrendingUp, Target, Clock } from "lucide-react";

export default function SessionAnalysis({ trades = [] }) {
  const sessionData = useMemo(() => {
    const sessions = {
      'Sydney': { start: 22, end: 7, icon: Moon, color: 'bg-yellow-300', trades: 0, pnl: 0, winRate: 0 },
      'Tokyo': { start: 0, end: 9, icon: Sunrise, color: 'bg-amber-300', trades: 0, pnl: 0, winRate: 0 },
      'London': { start: 8, end: 17, icon: Sun, color: 'bg-yellow-500', trades: 0, pnl: 0, winRate: 0 },
      'New York': { start: 13, end: 22, icon: Sunset, color: 'bg-orange-500', trades: 0, pnl: 0, winRate: 0 },
    };
    
    trades.forEach(trade => {
      const date = new Date(trade.created_at);
      const hour = date.getUTCHours();
      
      Object.entries(sessions).forEach(([name, session]) => {
        let isInSession = false;
        if (session.start < session.end) {
          isInSession = hour >= session.start && hour < session.end;
        } else {
          isInSession = hour >= session.start || hour < session.end;
        }
        
        if (isInSession) {
          session.trades++;
          session.pnl += trade.pnl || 0;
          if ((trade.pnl || 0) > 0) session.wins = (session.wins || 0) + 1;
        }
      });
    });
    
    return Object.entries(sessions).map(([name, data]) => ({
      name,
      ...data,
      winRate: data.trades > 0 ? ((data.wins || 0) / data.trades * 100).toFixed(1) : 0
    }));
  }, [trades]);
  
  const currentSession = useMemo(() => {
    const hour = new Date().getUTCHours();
    if (hour >= 22 || hour < 7) return 'Sydney';
    if (hour >= 0 && hour < 9) return 'Tokyo';
    if (hour >= 8 && hour < 17) return 'London';
    return 'New York';
  }, []);
  
  const totalPnl = sessionData.reduce((s, d) => s + d.pnl, 0);
  const bestSession = [...sessionData].sort((a, b) => b.pnl - a.pnl)[0];
  const worstSession = [...sessionData].sort((a, b) => a.pnl - b.pnl)[0];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Clock className="h-6 w-6 text-yellow-200" />
          Session Analysis
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-300/20">
          <span className="text-xs text-yellow-200 font-bold">Current: {currentSession}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sessionData.map((session) => {
          const Icon = session.icon;
          return (
            <motion.div
              key={session.name}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${session.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-black" />
                </div>
                <span className="text-sm text-slate-500">{session.name}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Trades</span>
                  <span className="text-white font-bold">{session.trades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Win Rate</span>
                  <span className={`font-bold ${parseFloat(session.winRate) >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {session.winRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">P&L</span>
                  <span className={`font-black ${session.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {session.pnl >= 0 ? '+' : ''}{session.pnl.toFixed(0)}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${session.trades > 0 ? (session.wins / session.trades * 100) : 0}%` }}
                  className={`h-full ${parseFloat(session.winRate) >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <span className="text-sm text-slate-400">Best Session</span>
          </div>
          <p className="text-xl font-black text-white">{bestSession?.name || '-'}</p>
          <p className="text-emerald-400 font-bold">+{bestSession?.pnl?.toFixed(0) || 0}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-rose-400" />
            <span className="text-sm text-slate-400">Worst Session</span>
          </div>
          <p className="text-xl font-black text-white">{worstSession?.name || '-'}</p>
          <p className="text-rose-400 font-bold">{worstSession?.pnl?.toFixed(0) || 0}</p>
        </div>
      </div>
      
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-white mb-3">Trading Hours Guide</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-24 text-slate-400">Sydney</div>
            <div className="text-white">22:00 - 07:00 UTC</div>
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-300/20 text-yellow-200">Low Volatility</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 text-slate-400">Tokyo</div>
            <div className="text-white">00:00 - 09:00 UTC</div>
            <span className="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-400">Medium Volatility</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 text-slate-400">London</div>
            <div className="text-white">08:00 - 17:00 UTC</div>
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">High Volatility</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 text-slate-400">New York</div>
            <div className="text-white">13:00 - 22:00 UTC</div>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">Highest Volatility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
