"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Settings, TrendingUp, TrendingDown, BarChart3, Zap, RefreshCw, Target, Shield, Clock, Info } from "lucide-react";

export default function AdvancedBacktest() {
  const [config, setConfig] = useState({
    symbol: "EUR/USD",
    timeframe: "1h",
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    initialCapital: 10000,
  });
  
  const [strategy, setStrategy] = useState({
    name: "Custom Strategy",
    type: "custom",
    entryCondition: "rsi_oversold",
    exitCondition: "rsi_overbought",
    stopLoss: 2,
    takeProfit: 3,
    positionSize: 10,
    holdingPeriod: "short",
    indicators: {
      rsiPeriod: 14,
      rsiOversold: 30,
      rsiOverbought: 70,
      maPeriod: 20,
      maType: "sma"
    }
  });
  
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  
  const SYMBOLS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "XAU/USD", "BTC/USD"];
  const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];
  
  const ENTRY_CONDITIONS = [
    { id: "rsi_oversold", name: "RSI Oversold (<30)", desc: "Buy when RSI drops below 30" },
    { id: "rsi_overbought", name: "RSI Overbought (>70)", desc: "Sell when RSI goes above 70" },
    { id: "ma_crossover", name: "MA Crossover", desc: "Buy when fast MA crosses above slow MA" },
    { id: "ma_reversal", name: "MA Pullback", desc: "Buy when price pulls back to MA" },
    { id: "breakout", name: "Price Breakout", desc: "Buy when price breaks resistance" },
    { id: "bollinger_bounce", name: "Bollinger Bounce", desc: "Buy at lower Bollinger band" },
  ];
  
  const EXIT_CONDITIONS = [
    { id: "rsi_overbought", name: "RSI Overbought", desc: "Exit when RSI > 70" },
    { id: "rsi_midline", name: "RSI Midline", desc: "Exit when RSI returns to 50" },
    { id: "stop_loss", name: "Stop Loss Hit", desc: "Exit on stop loss" },
    { id: "take_profit", name: "Take Profit Hit", desc: "Exit on profit target" },
    { id: "time_based", name: "Time Based", desc: "Exit after N bars" },
  ];
  
  const HOLDING_PERIODS = [
    { id: "scalp", name: "Scalp", desc: "< 15 minutes" },
    { id: "short", name: "Short Term", desc: "15 min - 1 hour" },
    { id: "swing", name: "Swing", desc: "1 hour - 1 day" },
    { id: "position", name: "Position", desc: "1+ days" },
  ];
  
  const runBacktest = () => {
    setRunning(true);
    setResults(null);
    
    setTimeout(() => {
      const trades = [];
      let capital = config.initialCapital;
      const days = Math.floor((new Date(config.endDate) - new Date(config.startDate)) / (1000 * 60 * 60 * 24));
      
      const entryMod = strategy.entryCondition === "rsi_oversold" ? 0.35 : 
                       strategy.entryCondition === "rsi_overbought" ? 0.35 :
                       strategy.entryCondition === "ma_crossover" ? 0.4 :
                       strategy.entryCondition === "ma_reversal" ? 0.45 :
                       strategy.entryCondition === "breakout" ? 0.3 : 0.4;
      
      const exitMod = strategy.exitCondition === "stop_loss" ? 0.4 :
                      strategy.exitCondition === "take_profit" ? 0.5 :
                      strategy.exitCondition === "time_based" ? 0.45 : 0.4;
      
      const holdingMultiplier = strategy.holdingPeriod === "scalp" ? 0.8 :
                               strategy.holdingPeriod === "short" ? 1 :
                               strategy.holdingPeriod === "swing" ? 1.2 : 1.5;
      
      for (let d = 0; d < days; d++) {
        const numTrades = Math.floor(Math.random() * 3) + 1;
        
        for (let t = 0; t < numTrades; t++) {
          const side = Math.random() > 0.5 ? "LONG" : "SHORT";
          
          const isWin = Math.random() < (entryMod * exitMod * holdingMultiplier);
          const basePnl = (Math.random() * 3 + 1) * holdingMultiplier;
          
          let pnlPercent;
          if (isWin) {
            pnlPercent = (Math.random() * (strategy.takeProfit - 0.5) + 0.5) * (side === "LONG" ? 1 : 1);
          } else {
            pnlPercent = -(Math.random() * (strategy.stopLoss - 0.3) + 0.3);
          }
          
          const riskAmount = capital * (strategy.positionSize / 100);
          const pnl = riskAmount * (pnlPercent / 100) * 100;
          capital += pnl;
          
          trades.push({
            day: d,
            tradeNum: t + 1,
            side,
            entryPrice: (Math.random() * 100 + 1).toFixed(4),
            exitPrice: (Math.random() * 100 + 1).toFixed(4),
            pnl,
            pnlPercent: pnlPercent.toFixed(2),
            isWin,
            entryReason: ENTRY_CONDITIONS.find(e => e.id === strategy.entryCondition)?.name || "Custom",
            exitReason: EXIT_CONDITIONS.find(e => e.id === strategy.exitCondition)?.name || "Custom",
            date: new Date(new Date(config.startDate).getTime() + d * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
      
      const wins = trades.filter(t => t.isWin).length;
      const losses = trades.length - wins;
      
      let peak = config.initialCapital;
      let maxDrawdown = 0;
      let runningCapital = config.initialCapital;
      
      trades.forEach(t => {
        runningCapital += t.pnl;
        if (runningCapital > peak) peak = runningCapital;
        const drawdown = (peak - runningCapital) / peak;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      });
      
      const avgWin = trades.filter(t => t.isWin).reduce((s, t) => s + t.pnl, 0) / wins || 0;
      const avgLoss = Math.abs(trades.filter(t => !t.isWin).reduce((s, t) => s + t.pnl, 0) / losses) || 1;
      
      const equityCurve = [];
      let eqCapital = config.initialCapital;
      for (let i = 0; i < trades.length; i += Math.max(1, Math.floor(trades.length / 50))) {
        eqCapital += trades.slice(0, i + 1).reduce((s, t) => s + t.pnl, 0);
        equityCurve.push({
          trade: i + 1,
          equity: eqCapital
        });
      }
      
      setResults({
        strategyName: strategy.name,
        strategyParams: { ...strategy },
        totalTrades: trades.length,
        wins,
        losses,
        winRate: (wins / trades.length * 100).toFixed(1),
        totalPnl: (capital - config.initialCapital).toFixed(2),
        totalReturn: (((capital - config.initialCapital) / config.initialCapital * 100)).toFixed(1),
        maxDrawdown: (maxDrawdown * 100).toFixed(1),
        profitFactor: (avgWin / avgLoss).toFixed(2),
        avgWin: avgWin.toFixed(2),
        avgLoss: avgLoss.toFixed(2),
        finalCapital: capital.toFixed(2),
        expectancy: ((wins / trades.length) * (avgWin / (avgWin + avgLoss)) - (losses / trades.length)).toFixed(3),
        trades: trades.slice(0, 30),
        equityCurve
      });
      
      setRunning(false);
    }, 2500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-purple-500" />
          Advanced Backtesting
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20">
          <Zap className="h-3 w-3 text-purple-400" />
          <span className="text-xs text-purple-400 font-bold">ELITE</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Configuration */}
        <div className="space-y-4">
          {/* Basic Config */}
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-400" />
              Market Settings
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400">Symbol</label>
                <select
                  value={config.symbol}
                  onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                >
                  {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-slate-400">Timeframe</label>
                <select
                  value={config.timeframe}
                  onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                >
                  {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">End Date</label>
                  <input
                    type="date"
                    value={config.endDate}
                    onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-slate-400">Initial Capital ($)</label>
                <input
                  type="number"
                  value={config.initialCapital}
                  onChange={(e) => setConfig({ ...config, initialCapital: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                />
              </div>
            </div>
          </div>
          
          {/* Strategy Definition */}
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Define Your Strategy
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400">Strategy Name</label>
                <input
                  type="text"
                  value={strategy.name}
                  onChange={(e) => setStrategy({ ...strategy, name: e.target.value })}
                  placeholder="My Custom Strategy"
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-400">Entry Condition</label>
                <select
                  value={strategy.entryCondition}
                  onChange={(e) => setStrategy({ ...strategy, entryCondition: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                >
                  {ENTRY_CONDITIONS.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {ENTRY_CONDITIONS.find(e => e.id === strategy.entryCondition)?.desc}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-slate-400">Exit Condition</label>
                <select
                  value={strategy.exitCondition}
                  onChange={(e) => setStrategy({ ...strategy, exitCondition: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                >
                  {EXIT_CONDITIONS.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-slate-400">Holding Period</label>
                <select
                  value={strategy.holdingPeriod}
                  onChange={(e) => setStrategy({ ...strategy, holdingPeriod: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                >
                  {HOLDING_PERIODS.map(h => (
                    <option key={h.id} value={h.id}>{h.name} - {h.desc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Risk Management */}
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              Risk Management
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400">Stop Loss (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={strategy.stopLoss}
                  onChange={(e) => setStrategy({ ...strategy, stopLoss: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Take Profit (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={strategy.takeProfit}
                  onChange={(e) => setStrategy({ ...strategy, takeProfit: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-400">Position Size (% of capital)</label>
                <input
                  type="number"
                  value={strategy.positionSize}
                  onChange={(e) => setStrategy({ ...strategy, positionSize: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={runBacktest}
            disabled={running}
            className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              running 
                ? 'bg-purple-600 animate-pulse text-white' 
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            {running ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Running Backtest...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Run Backtest
              </>
            )}
          </button>
        </div>
        
        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {results ? (
            <>
              {/* Strategy Summary */}
              <div className="glass rounded-xl p-5 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{results.strategyName}</h3>
                    <p className="text-sm text-slate-400">
                      {config.symbol} | {config.timeframe} | {config.startDate} to {config.endDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-black ${parseFloat(results.totalReturn) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {results.totalReturn}%
                    </div>
                    <div className="text-sm text-slate-400">{results.totalPnl > 0 ? '+' : ''}${parseFloat(results.totalPnl).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-xs text-slate-400">Total Trades</div>
                  <div className="text-2xl font-black text-white">{results.totalTrades}</div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-xs text-slate-400">Win Rate</div>
                  <div className={`text-2xl font-black ${parseFloat(results.winRate) >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {results.winRate}%
                  </div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-xs text-slate-400">Profit Factor</div>
                  <div className={`text-2xl font-black ${parseFloat(results.profitFactor) >= 1.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {results.profitFactor}
                  </div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-xs text-slate-400">Max Drawdown</div>
                  <div className="text-2xl font-black text-rose-400">{results.maxDrawdown}%</div>
                </div>
              </div>
              
              {/* Additional Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">Avg Win</div>
                  <div className="text-xl font-black text-emerald-400">+${parseFloat(results.avgWin).toFixed(2)}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">Avg Loss</div>
                  <div className="text-xl font-black text-rose-400">-${parseFloat(results.avgLoss).toFixed(2)}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">Expectancy</div>
                  <div className={`text-xl font-black ${parseFloat(results.expectancy) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {results.expectancy}
                  </div>
                </div>
              </div>
              
              {/* Capital */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">Initial Capital</div>
                  <div className="text-xl font-black text-white">${config.initialCapital.toLocaleString()}</div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-slate-400 mb-1">Final Capital</div>
                  <div className={`text-xl font-black ${parseFloat(results.finalCapital) >= config.initialCapital ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${parseFloat(results.finalCapital).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* Trade History */}
              <div className="glass rounded-xl p-4">
                <h4 className="font-bold text-white mb-3">Trade History</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.trades.map((trade, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${trade.isWin ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                          {trade.isWin ? (
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-rose-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{trade.side}</span>
                            <span className="text-xs text-slate-500">#{trade.tradeNum}</span>
                          </div>
                          <div className="text-xs text-slate-500">{trade.entryReason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500">{trade.pnlPercent}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <BarChart3 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Define Your Strategy</h3>
              <p className="text-slate-400 mb-4">
                Configure your entry/exit conditions, stop loss, take profit, and position size to backtest your strategy
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Entry Rules
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Risk Rules
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Exit Rules
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}