"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, Trophy, Edit2, Check, X } from "lucide-react";

export default function PnLGoals({ trades = [] }) {
  const [goals, setGoals] = useState({
    daily: 100,
    weekly: 500,
    monthly: 2000,
    maxDrawdown: 200
  });
  const [editingGoal, setEditingGoal] = useState(null);
  const [editValue, setEditValue] = useState("");
  
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const daily = trades.filter(t => t.created_at?.startsWith(today)).reduce((s, t) => s + (t.pnl || 0), 0);
    const weekly = trades.filter(t => t.created_at && new Date(t.created_at) >= new Date(weekAgo)).reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    const monthly = trades.filter(t => t.created_at && new Date(t.created_at) >= new Date(monthAgo)).reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    
    let peak = 0;
    let maxDD = 0;
    const sorted = [...trades].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    let running = 0;
    sorted.forEach(t => {
      running += parseFloat(t.pnl) || 0;
      if (running > peak) peak = running;
      const dd = peak - running;
      if (dd > maxDD) maxDD = dd;
    });
    
    return { daily, weekly, monthly, maxDrawdown: maxDD };
  }, [trades]);
  
  const goalsList = [
    { key: 'daily', label: 'Daily Goal', current: stats.daily, target: goals.daily, period: 'today', color: 'blue', invert: false },
    { key: 'weekly', label: 'Weekly Goal', current: stats.weekly, target: goals.weekly, period: 'this week', color: 'purple', invert: false },
    { key: 'monthly', label: 'Monthly Goal', current: stats.monthly, target: goals.monthly, period: 'this month', color: 'green', invert: false },
    { key: 'maxDrawdown', label: 'Max Drawdown', current: stats.maxDrawdown, target: goals.maxDrawdown, period: 'allowed', color: 'rose', invert: true },
  ];
  
  const getProgress = (current, target, invert = false) => {
    const pct = Math.min(Math.abs(current) / Math.abs(target) * 100, 100);
    return invert ? Math.max(0, 100 - pct) : pct;
  };
  
  const getStatus = (current, target, invert = false) => {
    if (invert) {
      if (current >= target) return 'danger';
      if (current >= target * 0.7) return 'warning';
      return 'safe';
    }
    if (current >= target) return 'complete';
    if (current >= target * 0.5) return 'good';
    return 'pending';
  };
  
  const startEdit = (key, currentValue) => {
    setEditingGoal(key);
    setEditValue(currentValue.toString());
  };
  
  const saveEdit = () => {
    const value = parseFloat(editValue) || 0;
    setGoals(prev => ({ ...prev, [editingGoal]: value }));
    setEditingGoal(null);
    setEditValue("");
  };
  
  const cancelEdit = () => {
    setEditingGoal(null);
    setEditValue("");
  };
  
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const dailyRate = stats.monthly > 0 ? (stats.monthly / currentDay).toFixed(0) : 0;
  const projectedMonthly = (parseInt(dailyRate) * daysInMonth) || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Target className="h-6 w-6 text-yellow-500" />
          P&L Goals
        </h2>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span className="text-sm text-yellow-400">Set & track your targets</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goalsList.map((goal) => {
          const progress = getProgress(goal.current, goal.target, goal.invert);
          const status = getStatus(goal.current, goal.target, goal.invert);
          
          const colors = {
            complete: 'bg-emerald-500',
            good: 'bg-yellow-500',
            pending: 'bg-slate-600',
            safe: 'bg-emerald-500',
            warning: 'bg-orange-500',
            danger: 'bg-rose-500'
          };
          
          const colorClasses = {
            blue: { bg: 'bg-yellow-500', text: 'text-yellow-300', border: 'border-yellow-500/30' },
            purple: { bg: 'bg-amber-500', text: 'text-amber-300', border: 'border-amber-500/30' },
            green: { bg: 'bg-green-600', text: 'text-green-400', border: 'border-green-500/30' },
            rose: { bg: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-500/30' },
          };
          
          return (
            <motion.div
              key={goal.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {goal.invert ? (
                    <AlertTriangle className={`h-5 w-5 ${status === 'safe' ? 'text-emerald-400' : status === 'warning' ? 'text-orange-400' : 'text-rose-400'}`} />
                  ) : (
                    <DollarSign className={`h-5 w-5 ${
                      status === 'complete' ? 'text-emerald-400' : 
                      status === 'good' ? 'text-yellow-300' : 'text-slate-400'
                    }`} />
                  )}
                  <span className="font-bold text-white">{goal.label}</span>
                </div>
                <button
                  onClick={() => startEdit(goal.key, goal.target)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                  <Edit2 className="h-4 w-4 text-slate-500 hover:text-white" />
                </button>
              </div>
              
              {editingGoal === goal.key ? (
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-slate-800 border border-yellow-300 rounded-lg pl-7 pr-3 py-2 text-white focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={saveEdit}
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                  >
                    <Check className="h-4 w-4 text-white" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`text-2xl font-black ${
                      goal.invert 
                        ? (status === 'safe' ? 'text-emerald-400' : status === 'warning' ? 'text-orange-400' : 'text-rose-400')
                        : (status === 'complete' ? 'text-emerald-400' : 'text-white')
                    }`}>
                      ${goal.invert ? goal.current.toFixed(0) : goal.current.toFixed(0)}
                    </span>
                    <span className="text-slate-400">/ ${goal.target}</span>
                  </div>
                  
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${colors[status]}`}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${
                  status === 'complete' ? 'text-emerald-400' :
                  status === 'good' ? 'text-yellow-300' :
                  status === 'danger' ? 'text-rose-400' :
                  status === 'warning' ? 'text-orange-400' :
                  status === 'safe' ? 'text-emerald-400' :
                  'text-slate-400'
                }`}>
                  {goal.invert 
                    ? (status === 'safe' ? '✓ Under limit' : status === 'warning' ? '⚠ Near limit' : '✗ Over limit!')
                    : (status === 'complete' ? '✓ Goal reached!' : `${progress.toFixed(0)}% complete`)
                  }
                </span>
                <span className="text-slate-500">
                  {goal.invert ? `${(100 - progress).toFixed(0)}% remaining` : `${(goal.target - goal.current).toFixed(0)} to go`}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="glass rounded-xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-yellow-200" />
          Monthly Projection
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-1">Daily Average So Far</div>
            <div className="text-2xl font-black text-white">${dailyRate}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-1">Projected Monthly</div>
            <div className={`text-2xl font-black ${parseInt(projectedMonthly) >= goals.monthly ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${projectedMonthly}
            </div>
          </div>
        </div>
        
        {parseInt(projectedMonthly) < goals.monthly && projectedMonthly > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <p className="text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              You're behind by ${(goals.monthly - parseInt(projectedMonthly)).toFixed(0)} to reach your monthly goal
            </p>
          </div>
        )}
        
        {parseInt(projectedMonthly) >= goals.monthly && projectedMonthly > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              You're on track to exceed your monthly goal!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
