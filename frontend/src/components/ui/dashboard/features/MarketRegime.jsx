"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Clock, BarChart3, Brain } from "lucide-react";

const REGIMES = [
  { id: 'trend_up', label: 'Uptrend', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { id: 'trend_down', label: 'Downtrend', icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  { id: 'ranging', label: 'Ranging', icon: Target, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { id: 'volatile', label: 'Volatile', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'low_vol', label: 'Low Volatility', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
];

function detectMarketRegime(trade, allTrades) {
  // Simple regime detection based on price movement and time
  const entry = parseFloat(trade.entry_price ?? trade.entryPrice) || 0;
  const exit = parseFloat(trade.exit_price ?? trade.exitPrice) || 0;
  const pnl = parseFloat(trade.pnl) || 0;
  const priceChange = entry > 0 && exit > 0 ? Math.abs((exit - entry) / entry * 100) : 0;
  
  // High volatility: large price movement
  if (priceChange > 3) return 'volatile';
  
  // Trend based on direction and outcome
  if (trade.side === 'LONG' && pnl > 0) return 'trend_up';
  if (trade.side === 'SHORT' && pnl > 0) return 'trend_down';
  
  // Low volatility: small price movement
  if (priceChange < 0.5) return 'low_vol';
  
  // Default to ranging
  return 'ranging';
}

export default function MarketRegimeTags({ trades = [] }) {
  const [selectedRegime, setSelectedRegime] = useState(null);
  
  const regimeData = useMemo(() => {
    if (!trades.length) {
      return REGIMES.map(regime => ({
        ...regime,
        count: 0,
        wins: 0,
        pnl: 0,
        winRate: 0
      }));
    }
    
    const stats = {};
    REGIMES.forEach(r => {
      stats[r.id] = { count: 0, wins: 0, pnl: 0 };
    });
    
    trades.forEach(trade => {
      const regime = detectMarketRegime(trade, trades);
      if (!stats[regime]) return;
      stats[regime].count++;
      if ((trade.pnl || 0) > 0) stats[regime].wins++;
      stats[regime].pnl += (trade.pnl || 0);
    });
    
    return REGIMES.map(regime => {
      const s = stats[regime.id] || { count: 0, wins: 0, pnl: 0 };
      return {
        ...regime,
        count: s.count,
        wins: s.wins,
        pnl: s.pnl,
        winRate: s.count ? ((s.wins / s.count) * 100).toFixed(0) : 0
      };
    });
  }, [trades]);
  
  const insights = useMemo(() => {
    if (!trades.length) return [];
    
    const insightsList = [];
    const uptrend = regimeData.find(r => r.id === 'trend_up');
    const downtrend = regimeData.find(r => r.id === 'trend_down');
    const ranging = regimeData.find(r => r.id === 'ranging');
    const volatile = regimeData.find(r => r.id === 'volatile');
    
    if (uptrend && parseFloat(uptrend.winRate) > 60) {
      insightsList.push({
        text: `You win ${uptrend.winRate}% in uptrends - your strongest edge`,
        color: 'text-emerald-400'
      });
    }
    
    if (downtrend && parseFloat(downtrend.winRate) > 60) {
      insightsList.push({
        text: `Short selling works well for you (${downtrend.winRate}% win rate)`,
        color: 'text-emerald-400'
      });
    }
    
    if (volatile && volatile.count > 0 && parseFloat(volatile.winRate) < 40) {
      insightsList.push({
        text: `Avoid volatile markets - only ${volatile.winRate}% win rate`,
        color: 'text-rose-400'
      });
    }
    
    if (ranging && parseFloat(ranging.winRate) > 50 && ranging.count > 3) {
      insightsList.push({
        text: `Ranging markets are profitable for you`,
        color: 'text-yellow-200'
      });
    }
    
    const bestRegime = regimeData.reduce((best, r) => 
      r.pnl > (best?.pnl || -Infinity) ? r : best, null);
    if (bestRegime && bestRegime.pnl > 0) {
      insightsList.push({
        text: `Best performing: ${bestRegime.label} ($${bestRegime.pnl.toFixed(0)})`,
        color: 'text-amber-400'
      });
    }
    
    return insightsList.slice(0, 4);
  }, [trades, regimeData]);
  
  const filteredTrades = useMemo(() => {
    if (!selectedRegime) return trades.slice(0, 10);
    return trades.filter(t => detectMarketRegime(t, trades) === selectedRegime).slice(0, 10);
  }, [trades, selectedRegime]);
  
  const selectedRegimeData = regimeData.find(r => r.id === selectedRegime);
  
  if (!trades.length) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Add trades to see market regime analysis</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-yellow-200" />
            Market Regime Analysis
          </h2>
          <p className="text-slate-400">Know when you win or lose</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {regimeData.map(regime => (
          <motion.button
            key={regime.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRegime(selectedRegime === regime.id ? null : regime.id)}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedRegime === regime.id ? `ring-2 ring-yellow-300 ${regime.bg}` : `${regime.bg} ${regime.border} hover:border-yellow-200/30`
            }`}
          >
            <regime.icon className={`h-6 w-6 ${regime.color} mb-2`} />
            <div className="font-bold text-white">{regime.label}</div>
            <div className="text-xs text-slate-400 mt-1">
              {regime.count} trades • {regime.winRate}% win
            </div>
            <div className={`text-sm font-bold ${regime.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {regime.pnl >= 0 ? '+' : ''}${regime.pnl.toFixed(0)}
            </div>
          </motion.button>
        ))}
      </div>
      
      {selectedRegime && selectedRegimeData && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <selectedRegimeData.icon className={`h-5 w-5 ${selectedRegimeData.color}`} />
              {selectedRegimeData.label} Trades
            </h3>
            <button 
              onClick={() => setSelectedRegime(null)}
              className="text-sm text-slate-400 hover:text-white"
            >
              Clear filter
            </button>
          </div>
          
          {filteredTrades.length > 0 ? (
            <div className="space-y-2">
              {filteredTrades.map((trade, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{trade.symbol}</span>
                    <span className="text-xs text-slate-500">{trade.strategy}</span>
                  </div>
                  <span className={`font-bold ${(trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {(trade.pnl || 0) >= 0 ? '+' : ''}${parseFloat(trade.pnl || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No trades in this regime</p>
          )}
        </motion.div>
      )}
      
      {insights.length > 0 && (
        <div className="glass rounded-xl p-6 border-l-4 border-l-yellow-300">
          <h3 className="text-lg font-bold mb-4 text-white">Key Insights</h3>
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2">
                <Brain className="h-4 w-4 text-yellow-200 mt-1 shrink-0" />
                <span className={insight.color}>{insight.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Regime</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Trades</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Wins</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Win Rate</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">P&L</th>
              </tr>
            </thead>
            <tbody>
              {regimeData.map(regime => (
                <tr key={regime.id} className="border-b border-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <regime.icon className={`h-4 w-4 ${regime.color}`} />
                      <span className="font-medium text-white">{regime.label}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-slate-300">{regime.count}</td>
                  <td className="text-right py-3 px-4 text-emerald-400">{regime.wins}</td>
                  <td className="text-right py-3 px-4 text-slate-300">{regime.winRate}%</td>
                  <td className={`text-right py-3 px-4 font-bold ${regime.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {regime.pnl >= 0 ? '+' : ''}${regime.pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
