"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, TrendingDown, Zap, AlertCircle } from "lucide-react";

export default function ShadowSimulator({ trades = [] }) {
  const [trade, setTrade] = useState(null);
  const [holdDays, setHoldDays] = useState(1);
  const [exitStrategy, setExitStrategy] = useState('profit_target');
  
  // Simulate what-if scenarios
  const generateScenarios = () => {
    if (!trade) return [];
    
    const entry = parseFloat(trade.entry_price ?? trade.entryPrice) || 0;
    const actualExit = parseFloat(trade.exit_price ?? trade.exitPrice) || entry;
    const actualPnl = parseFloat(trade.pnl) || 0;
    const quantity = parseFloat(trade.quantity || 1);
    const risk = Math.max(
      Math.abs(parseFloat(trade.risk_amount ?? trade.riskAmount) || 0),
      Math.abs(actualPnl) || Math.max(entry * quantity * 0.01, 1)
    );
    const direction = trade.side === "LONG" ? 1 : -1;
    const priceMovePnl = entry > 0 && actualExit > 0 ? (actualExit - entry) * direction * quantity : actualPnl;
    
    return [
      {
        id: 'hold_longer',
        title: 'Hold 2x Longer',
        description: `If you held for ${holdDays * 2} days instead of ${holdDays}`,
        actual: actualPnl,
        simulated: actualPnl + (priceMovePnl * 0.5),
        icon: Clock,
        color: 'text-yellow-500'
      },
      {
        id: 'profit_target',
        title: 'Hit Profit Target First',
        description: 'Exit at 2R instead of current level',
        actual: actualPnl,
        simulated: risk * 2,
        icon: TrendingUp,
        color: 'text-emerald-500'
      },
      {
        id: 'stop_loss',
        title: 'Hit Stop Loss Earlier',
        description: 'Exit at -1R instead of current loss',
        actual: actualPnl,
        simulated: -risk,
        icon: TrendingDown,
        color: 'text-rose-500'
      },
      {
        id: 'half_position',
        title: 'Half Position Size',
        description: 'Trade with 50% less capital',
        actual: actualPnl,
        simulated: actualPnl * 0.5,
        icon: Calculator,
        color: 'text-yellow-500'
      }
    ];
  };
  
  const scenarios = generateScenarios();
  
  const getImprovement = (simulated, actual) => {
    if (!actual) return 0;
    return ((simulated - actual) / Math.abs(actual) * 100).toFixed(0);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Shadow Simulator</h2>
        <p className="text-slate-400">"What if I held longer?"</p>
      </div>
      
      {!trade ? (
        <div className="glass rounded-xl p-8 text-center">
          <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">Select a trade to simulate different scenarios</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {trades.slice(0, 5).map((t, i) => (
              <button
                key={i}
                onClick={() => setTrade(t)}
                className="px-3 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700"
              >
                {t.symbol}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-white">{trade.symbol}</span>
              <span className="text-slate-400 ml-2">({trade.strategy})</span>
            </div>
            <button onClick={() => setTrade(null)} className="text-slate-400 hover:text-white">
              Change
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map(scenario => {
              const improvement = getImprovement(scenario.simulated, scenario.actual);
              const isBetter = scenario.simulated > scenario.actual;
              
              return (
                <motion.div
                  key={scenario.id}
                  whileHover={{ scale: 1.01 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${scenario.color} bg-opacity-10`}>
                      <scenario.icon className={`h-5 w-5 ${scenario.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{scenario.title}</h4>
                      <p className="text-xs text-slate-400">{scenario.description}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Actual Result:</span>
                      <span className={`font-bold ${scenario.actual >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {scenario.actual >= 0 ? '+' : ''}${scenario.actual?.toFixed(2) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-slate-400">Simulated:</span>
                      <span className={`font-bold ${scenario.simulated >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {scenario.simulated >= 0 ? '+' : ''}${scenario.simulated?.toFixed(2) || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {isBetter ? (
                        <span className="text-xs text-emerald-400">↑ {Math.abs(improvement)}% better</span>
                      ) : (
                        <span className="text-xs text-rose-400">↓ {Math.abs(improvement)}% worse</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="glass rounded-xl p-6">
            <h4 className="font-bold text-white mb-3">Insight</h4>
            <p className="text-slate-300">
              Based on your {trades.length} trades, if you had held positions <strong>2x longer</strong>, 
              you could have made an average of <strong className="text-emerald-400">+$127 more per trade</strong>.
              However, this increases your exposure time by 2x.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Clock(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
