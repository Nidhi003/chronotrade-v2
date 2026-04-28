"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, AlertTriangle, Brain } from "lucide-react";

export default function TradingPsychologyScore({ trades = [] }) {
  const [score, setScore] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  
  useEffect(() => {
    if (!trades.length) return;
    
    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl <= 0);
    let totalScore = 0;
    
    const winRate = wins.length / trades.length;
    totalScore += winRate * 20;
    
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 1;
    const riskReward = avgWin / avgLoss;
    totalScore += Math.min(riskReward * 10, 20);
    
    const sizes = trades.map(t => Math.abs(t.pnl || 0));
    const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const sizeVariance = sizes.reduce((a, b) => a + Math.pow(b - avgSize, 2), 0) / sizes.length;
    const sizeCV = Math.sqrt(sizeVariance) / avgSize;
    totalScore += Math.max(0, 20 - sizeCV * 20);
    
    let recoveryCount = 0;
    for (let i = 1; i < trades.length; i++) {
      if (trades[i-1].pnl < 0 && trades[i].pnl > 0) recoveryCount++;
    }
    const recoveryRate = recoveryCount / Math.max(losses.length, 1);
    totalScore += recoveryRate * 20;
    
    const today = new Date();
    const thisWeekTrades = trades.filter(t => {
      const tradeDate = new Date(t.created_at);
      const diff = today - tradeDate;
      return diff < 7 * 24 * 60 * 60 * 1000;
    });
    const overTradingPenalty = Math.max(0, (thisWeekTrades.length - 20) / 10);
    totalScore += Math.max(0, 20 - overTradingPenalty * 5);
    
    setScore(Math.round(totalScore));
    
    setAnalysis({
      winRate: (winRate * 100).toFixed(0),
      riskReward: riskReward.toFixed(2),
      discipline: Math.max(0, 100 - sizeCV * 100).toFixed(0),
      recovery: (recoveryRate * 100).toFixed(0),
      consistency: Math.max(0, 100 - overTradingPenalty * 5).toFixed(0),
      breakdown: [
        { area: "Win Rate", score: Math.round(winRate * 20), max: 20 },
        { area: "Risk Management", score: Math.min(riskReward * 10, 20), max: 20 },
        { area: "Discipline", score: Math.max(0, 20 - sizeCV * 20), max: 20 },
        { area: "Recovery", score: Math.round(recoveryRate * 20), max: 20 },
        { area: "Consistency", score: Math.max(0, 20 - overTradingPenalty * 5), max: 20 },
      ]
    });
  }, [trades]);
  
  const getScoreColor = (s) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 60) return 'text-yellow-300';
    if (s >= 40) return 'text-yellow-400';
    return 'text-rose-400';
  };
  
  const getGrade = (s) => {
    if (s >= 90) return 'S';
    if (s >= 80) return 'A';
    if (s >= 70) return 'B';
    if (s >= 60) return 'C';
    if (s >= 50) return 'D';
    return 'F';
  };
  
  if (!trades.length) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <Brain className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Add trades to get your psychology score</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Brain className="h-6 w-6 text-yellow-200" />
          Trading Psychology Score
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="glass rounded-xl p-8 text-center"
        >
          <div className="text-6xl font-black mb-2">
            <span className={getScoreColor(score)}>{getGrade(score)}</span>
          </div>
          <div className={`text-5xl font-black ${getScoreColor(score)}`}>
            {score}/100
          </div>
          <p className="text-slate-400 mt-2">Overall Psychology Score</p>
        </motion.div>
        
        <div className="glass rounded-xl p-6">
          <h3 className="font-bold text-white mb-4">Score Breakdown</h3>
          {analysis?.breakdown.map((item, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">{item.area}</span>
                <span className="text-white">{Math.round(item.score)}/{item.max}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / item.max) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  className={`h-full ${
                    item.score / item.max >= 0.8 ? 'bg-emerald-500' :
                    item.score / item.max >= 0.6 ? 'bg-yellow-500' :
                    item.score / item.max >= 0.4 ? 'bg-yellow-500' : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
