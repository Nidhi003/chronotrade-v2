"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, X, DollarSign } from "lucide-react";

export default function TradeCalendar({ trades = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  
  const { days, monthlyPnl, weeklyPnl, totalPnl } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    
    // Calendar days
    const daysArray = [];
    
    // Padding days from previous month
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      daysArray.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: false,
        trades: [],
        pnl: 0
      });
    }
    
    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTrades = trades.filter(t => {
        if (!t.created_at) return false;
        return new Date(t.created_at).toISOString().split('T')[0] === dateStr;
      });
      
      daysArray.push({
        date,
        dateStr,
        isCurrentMonth: true,
        trades: dayTrades,
        pnl: dayTrades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0)
      });
    }
    
    // Padding days for next month
    const remaining = 42 - daysArray.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      daysArray.push({
        date,
        dateStr: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        trades: [],
        pnl: 0
      });
    }
    
    // Weekly P&L
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekly = trades
      .filter(t => t.created_at && new Date(t.created_at) >= startOfWeek)
      .reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    
    // Monthly P&L
    const startOfMonth = new Date(year, month, 1);
    const monthly = trades
      .filter(t => t.created_at && new Date(t.created_at) >= startOfMonth)
      .reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    
    // Total P&L
    const total = trades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    
    return { days: daysArray, monthlyPnl: monthly, weeklyPnl: weekly, totalPnl: total };
  }, [trades, currentMonth]);
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const today = new Date().toISOString().split('T')[0];
  
  const getDayColor = (day) => {
    if (!day.isCurrentMonth || day.trades.length === 0) return 'bg-slate-800/30';
    if (day.pnl > 0) {
      if (day.pnl > 100) return 'bg-emerald-500';
      if (day.pnl > 50) return 'bg-emerald-400';
      return 'bg-emerald-600';
    }
    if (day.pnl < 0) {
      if (day.pnl < -100) return 'bg-rose-500';
      if (day.pnl < -50) return 'bg-rose-400';
      return 'bg-rose-600';
    }
    return 'bg-slate-600';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-500" />
            Trade Calendar
          </h2>
          <p className="text-slate-400 text-sm">Monthly trading activity</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg glass hover:bg-white/10 transition"
          >
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </button>
          <span className="text-white font-bold min-w-[120px] text-center">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg glass hover:bg-white/10 transition"
          >
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </button>
        </div>
      </div>
      
      {/* P&L Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400 mb-1">This Week</div>
          <div className={`text-2xl font-black ${weeklyPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {weeklyPnl >= 0 ? '+' : ''}${weeklyPnl.toFixed(0)}
          </div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400 mb-1">This Month</div>
          <div className={`text-2xl font-black ${monthlyPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {monthlyPnl >= 0 ? '+' : ''}${monthlyPnl.toFixed(0)}
          </div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400 mb-1">Total</div>
          <div className={`text-2xl font-black ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(0)}
          </div>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="glass rounded-xl p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs text-slate-500 font-bold uppercase">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const isToday = day.dateStr === today;
            const hasTrades = day.trades.length > 0;
            const isSelected = selectedDay?.dateStr === day.dateStr;
            
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => day.isCurrentMonth && hasTrades && setSelectedDay(isSelected ? null : day)}
                className={`
                  relative aspect-square rounded-xl p-2 flex flex-col items-center justify-center
                  transition-all cursor-pointer
                  ${!day.isCurrentMonth ? 'opacity-30' : ''}
                  ${hasTrades ? getDayColor(day) : 'bg-slate-800/30'}
                  ${isToday ? 'ring-2 ring-blue-500' : ''}
                  ${isSelected ? 'ring-2 ring-white' : ''}
                  ${day.isCurrentMonth && !hasTrades ? 'hover:bg-slate-700' : ''}
                `}
              >
                <span className={`text-sm font-bold ${day.isCurrentMonth ? 'text-white' : 'text-slate-600'}`}>
                  {day.date.getDate()}
                </span>
                
                {hasTrades && day.isCurrentMonth && (
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-[10px] font-bold text-white/90">
                      {day.trades.length} {day.trades.length === 1 ? 'trade' : 'trades'}
                    </span>
                    <span className={`text-[10px] font-bold ${
                      day.pnl >= 0 ? 'text-emerald-200' : 'text-rose-200'
                    }`}>
                      {day.pnl >= 0 ? '+' : ''}{day.pnl >= 0 ? '' : ''}{Math.abs(day.pnl).toFixed(0)}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Selected Day Details */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-slate-400 text-sm">
                  {selectedDay.trades.length} {selectedDay.trades.length === 1 ? 'trade' : 'trades'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-slate-400">Day P&L</div>
                  <div className={`text-xl font-black ${selectedDay.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedDay.pnl >= 0 ? '+' : ''}${selectedDay.pnl.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            {/* Trades List */}
            <div className="space-y-2">
              {selectedDay.trades.map((trade, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {parseFloat(trade.pnl) >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-rose-400" />
                    )}
                    <div>
                      <div className="text-white font-bold">{trade.symbol || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">
                        {trade.side || 'LONG'} • {trade.quantity || '1'} lots
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-black ${parseFloat(trade.pnl) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {parseFloat(trade.pnl) >= 0 ? '+' : ''}${parseFloat(trade.pnl).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded" />
          <span>Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-600 rounded" />
          <span>No Trade</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-rose-500 rounded" />
          <span>Loss</span>
        </div>
      </div>
    </div>
  );
}