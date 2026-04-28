"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Grid3X3 } from "lucide-react";

export default function CorrelationMatrix({ trades = [] }) {
  const correlationData = useMemo(() => {
    const pairs = [...new Set(trades.map(t => t.symbol).filter(Boolean))];
    if (pairs.length < 2) return { pairs: [], matrix: [] };
    
    const returns = {};
    pairs.forEach(pair => {
      returns[pair] = [];
    });
    
    const sorted = [...trades].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    sorted.forEach(t => {
      if (t.symbol && t.pnl) {
        returns[t.symbol].push(t.pnl);
      }
    });
    
    const matrix = pairs.map(p1 => {
      return pairs.map(p2 => {
        if (p1 === p2) return 1;
        
        const r1 = returns[p1];
        const r2 = returns[p2];
        
        if (!r1.length || !r2.length) return 0;
        
        const minLen = Math.min(r1.length, r2.length);
        const slice1 = r1.slice(-minLen);
        const slice2 = r2.slice(-minLen);
        
        const mean1 = slice1.reduce((a, b) => a + b, 0) / slice1.length;
        const mean2 = slice2.reduce((a, b) => a + b, 0) / slice2.length;
        
        const cov = slice1.reduce((sum, v, i) => sum + (v - mean1) * (slice2[i] - mean2), 0) / minLen;
        const std1 = Math.sqrt(slice1.reduce((sum, v) => sum + (v - mean1) ** 2, 0) / minLen);
        const std2 = Math.sqrt(slice2.reduce((sum, v) => sum + (v - mean2) ** 2, 0) / minLen);
        
        if (std1 === 0 || std2 === 0) return 0;
        
        return cov / (std1 * std2);
      });
    });
    
    return { pairs, matrix };
  }, [trades]);
  
  const getColor = (corr) => {
    if (corr === 1) return 'bg-slate-700';
    if (corr > 0.7) return 'bg-emerald-500';
    if (corr > 0.3) return 'bg-emerald-700';
    if (corr > 0) return 'bg-emerald-900';
    if (corr > -0.3) return 'bg-rose-900';
    if (corr > -0.7) return 'bg-rose-700';
    return 'bg-rose-500';
  };
  
  if (correlationData.pairs.length < 2) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <Grid3X3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Add trades with different symbols to see correlations</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Grid3X3 className="h-6 w-6 text-cyan-500" />
          Correlation Matrix
        </h2>
      </div>
      
      <div className="glass rounded-xl p-6 overflow-x-auto">
        <div className="flex gap-1 mb-1">
          <div className="w-20" />
          {correlationData.pairs.map(pair => (
            <div key={pair} className="w-16 text-center text-xs text-slate-400 truncate">
              {pair}
            </div>
          ))}
        </div>
        
        {correlationData.pairs.map((rowPair, ri) => (
          <div key={rowPair} className="flex gap-1 mb-1">
            <div className="w-20 text-xs text-slate-400 truncate flex items-center">
              {rowPair}
            </div>
            {correlationData.matrix[ri]?.map((corr, ci) => (
              <motion.div
                key={ci}
                whileHover={{ scale: 1.1 }}
                className={`w-16 h-10 rounded flex items-center justify-center ${getColor(corr)}`}
                title={`${rowPair}/${correlationData.pairs[ci]}: ${corr.toFixed(2)}`}
              >
                <span className="text-xs text-white font-bold">
                  {corr.toFixed(1)}
                </span>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-white mb-3">Interpretation Guide</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="text-slate-400">0.7 to 1.0: Strong positive correlation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-700" />
            <span className="text-slate-400">0.3 to 0.7: Moderate positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-rose-700" />
            <span className="text-slate-400">-0.7 to -0.3: Moderate negative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-rose-500" />
            <span className="text-slate-400">-1.0 to -0.7: Strong negative</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Tip: Correlated pairs can be used for hedging or diversification strategies
        </p>
      </div>
    </div>
  );
}