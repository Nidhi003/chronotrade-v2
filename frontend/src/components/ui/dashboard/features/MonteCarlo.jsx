"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, RefreshCw, AlertTriangle, TrendingUp, Target } from "lucide-react";

export default function MonteCarloSimulation({ trades = [] }) {
  const [simulating, setSimulating] = useState(false);
  const [iterations, setIterations] = useState(1000);
  const [results, setResults] = useState(null);
  
  const runSimulation = () => {
    setSimulating(true);
    
    setTimeout(() => {
      const outcomes = [];
      const pnlSamples = trades.map(t => parseFloat(t.pnl) || 0).filter(v => Number.isFinite(v));
      const wins = pnlSamples.filter(v => v > 0);
      const losses = pnlSamples.filter(v => v <= 0);
      const winRate = pnlSamples.length ? wins.length / pnlSamples.length : 0.5;
      const avgWin = wins.length ? wins.reduce((s, v) => s + v, 0) / wins.length : 100;
      const avgLoss = losses.length ? Math.abs(losses.reduce((s, v) => s + v, 0) / losses.length) : 50;
      const samplePool = pnlSamples.length ? pnlSamples : [avgWin, -avgLoss];
      
      for (let i = 0; i < iterations; i++) {
        let balance = 10000;
        const equityCurve = [balance];
        
        let peak = balance;
        let maxDrawdown = 0;

        for (let j = 0; j < 100; j++) {
          const sampledPnl = samplePool[Math.floor(Math.random() * samplePool.length)];
          balance += sampledPnl;
          peak = Math.max(peak, balance);
          maxDrawdown = Math.max(maxDrawdown, peak > 0 ? ((peak - balance) / peak) * 100 : 0);
          equityCurve.push(balance);
        }
        outcomes.push({
          finalBalance: balance,
          maxDrawdown,
          peakEquity: Math.max(...equityCurve)
        });
      }
      
      outcomes.sort((a, b) => a.finalBalance - b.finalBalance);
      
      const percentiles = [5, 10, 25, 50, 75, 90, 95];
      const balanceByPercentile = {};
      percentiles.forEach(p => {
        const idx = Math.floor(outcomes.length * (p / 100));
        balanceByPercentile[p] = outcomes[idx].finalBalance;
      });
      
      const avgOutcome = outcomes.reduce((s, o) => s + o.finalBalance, 0) / outcomes.length;
      const medianOutcome = outcomes[Math.floor(outcomes.length / 2)].finalBalance;
      const probProfit = outcomes.filter(o => o.finalBalance > 10000).length / outcomes.length * 100;
      const probLoss20 = outcomes.filter(o => o.finalBalance < 8000).length / outcomes.length * 100;
      
      setResults({
        balanceByPercentile,
        avgOutcome: avgOutcome.toFixed(0),
        medianOutcome: medianOutcome.toFixed(0),
        probProfit: probProfit.toFixed(0),
        probLoss20: probLoss20.toFixed(0),
        winRate: (winRate * 100).toFixed(1),
        avgWin: avgWin.toFixed(2),
        avgLoss: avgLoss.toFixed(2),
        avgDrawdown: (outcomes.reduce((s, o) => s + o.maxDrawdown, 0) / outcomes.length).toFixed(1),
      });
      
      setSimulating(false);
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-yellow-200" />
            Monte Carlo Simulation
          </h2>
          <p className="text-slate-400">Project 1,000 possible outcomes</p>
        </div>
        <button 
          onClick={runSimulation}
          disabled={simulating}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 text-black rounded-xl font-bold hover:brightness-105 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${simulating ? 'animate-spin' : ''}`} />
          {simulating ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>
      
      {!results ? (
        <div className="glass rounded-xl p-8 text-center">
          <BarChart3 className="h-12 w-12 text-yellow-200 mx-auto mb-4" />
          <p className="text-slate-400">Click "Run Simulation" to see 1,000 possible outcomes based on your trading history</p>
          <p className="text-sm text-slate-500 mt-2">Uses your win rate, avg win, and avg loss to project future scenarios</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-slate-400">5th Percentile</div>
              <div className="text-lg font-black text-rose-400">${results.balanceByPercentile[5]}</div>
              <div className="text-xs text-slate-500">Worst case</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-slate-400">25th Percentile</div>
              <div className="text-lg font-black text-yellow-400">${results.balanceByPercentile[25]}</div>
              <div className="text-xs text-slate-500">Poor markets</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-slate-400">50th Percentile</div>
              <div className="text-lg font-black text-white">${results.medianOutcome}</div>
              <div className="text-xs text-slate-500">Median</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-slate-400">75th Percentile</div>
              <div className="text-lg font-black text-emerald-400">${results.balanceByPercentile[75]}</div>
              <div className="text-xs text-slate-500">Good markets</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-emerald-500" />
                <div>
                  <div className="font-bold text-white">Probability of Profit</div>
                  <div className="text-sm text-slate-400">After 100 trades</div>
                </div>
              </div>
              <div className="text-4xl font-black text-emerald-400">{results.probProfit}%</div>
              <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${results.probProfit}%` }} />
              </div>
            </div>
            
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
                <div>
                  <div className="font-bold text-white">Risk of 20% Loss</div>
                  <div className="text-sm text-slate-400">After 100 trades</div>
                </div>
              </div>
              <div className="text-4xl font-black text-rose-400">{results.probLoss20}%</div>
              <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${results.probLoss20}%` }} />
              </div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-6">
            <h4 className="font-bold text-white mb-3">Risk Assessment</h4>
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-yellow-200/10 bg-black/20 p-3">
                <div className="text-xs text-slate-400">Source Win Rate</div>
                <div className="text-xl font-black text-white">{results.winRate}%</div>
              </div>
              <div className="rounded-xl border border-yellow-200/10 bg-black/20 p-3">
                <div className="text-xs text-slate-400">Avg Win</div>
                <div className="text-xl font-black text-emerald-400">${results.avgWin}</div>
              </div>
              <div className="rounded-xl border border-yellow-200/10 bg-black/20 p-3">
                <div className="text-xs text-slate-400">Avg Loss</div>
                <div className="text-xl font-black text-rose-400">${results.avgLoss}</div>
              </div>
              <div className="rounded-xl border border-yellow-200/10 bg-black/20 p-3">
                <div className="text-xs text-slate-400">Avg Drawdown</div>
                <div className="text-xl font-black text-yellow-300">{results.avgDrawdown}%</div>
              </div>
            </div>
            <div className="space-y-2 text-slate-300">
              {parseFloat(results.probLoss20) > 20 ? (
                <p className="text-rose-400">⚠️ High risk: You have a {results.probLoss20}% chance of losing 20%+ of your account.</p>
              ) : (
                <p className="text-emerald-400">✓ Low risk: Your risk of catastrophic loss is under 20%.</p>
              )}
              {parseFloat(results.probProfit) > 70 ? (
                <p className="text-emerald-400">✓ Strong edge: {results.probProfit}% probability of profit over 100 trades.</p>
              ) : (
                <p className="text-yellow-400">⚠️ Weak edge: Consider reducing position size to improve risk/reward.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
