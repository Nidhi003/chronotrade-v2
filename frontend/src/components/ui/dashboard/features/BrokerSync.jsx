"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Radio } from "lucide-react";
import localStorageManager from "@/lib/storage";

const BROKERS = [
  { id: 'tradovate', name: 'Tradovate', logo: 'T', status: 'disconnected' },
  { id: 'tradingview', name: 'TradingView', logo: 'TV', status: 'disconnected' },
  { id: 'mt4', name: 'MT4/MT5', logo: 'MT', status: 'disconnected' },
  { id: 'alpaca', name: 'Alpaca', logo: 'AP', status: 'disconnected' },
  { id: 'interactive_brokers', name: 'Interactive Brokers', logo: 'IB', status: 'disconnected' },
];

const DEMO_MODE = true;

export default function BrokerSync() {
  const [brokers, setBrokers] = useState(() => {
    const saved = localStorage.getItem('chronotrade_brokers');
    return saved ? JSON.parse(saved) : BROKERS;
  });
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => localStorage.getItem('chronotrade_last_sync'));
  const [demoTrades, setDemoTrades] = useState([]);

  useEffect(() => {
    localStorage.setItem('chronotrade_brokers', JSON.stringify(brokers));
  }, [brokers]);

  const connectBroker = (id) => {
    setBrokers(prev => prev.map(b => 
      b.id === id ? { ...b, status: b.status === 'connected' ? 'disconnected' : 'connecting' } : b
    ));

    setTimeout(() => {
      setBrokers(prev => prev.map(b => 
        b.id === id ? { ...b, status: 'connected' } : b
      ));
      localStorage.setItem('chronotrade_last_sync', new Date().toISOString());
      setLastSync(new Date().toISOString());
    }, 2000);
  };

  const syncNow = () => {
    setSyncing(true);
    
    const connectedBrokers = brokers.filter(b => b.status === 'connected');
    const trades = [];
    
    connectedBrokers.forEach(broker => {
      const symbols = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'BTC/USD'];
      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        trades.push({
          id: Date.now() + Math.random(),
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          side: Math.random() > 0.5 ? 'LONG' : 'SHORT',
          quantity: Math.floor(Math.random() * 10) + 1,
          entryPrice: (Math.random() * 2000 + 100).toFixed(2),
          exitPrice: (Math.random() * 2000 + 100).toFixed(2),
          pnl: parseFloat((Math.random() - 0.3) * 200).toFixed(2),
          status: Math.random() > 0.3 ? 'WIN' : 'LOSS',
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          broker: broker.name,
          synced: true
        });
      }
    });
    
    setTimeout(() => {
      trades.forEach(trade => localStorageManager.addTrade(trade));
      setDemoTrades(trades);
      setSyncing(false);
      localStorage.setItem('chronotrade_last_sync', new Date().toISOString());
      setLastSync(new Date().toISOString());
      window.dispatchEvent(new CustomEvent('tradesUpdated'));
    }, 3000);
  };
  
  const connectedCount = brokers.filter(b => b.status === 'connected').length;

  return (
    <div className="space-y-6">
      {DEMO_MODE && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <span className="text-amber-400 text-sm font-medium">Demo Mode - Connect brokers to see how it works</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Radio className="h-6 w-6 text-cyan-500" />
          Real-Time Broker Sync
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2 h-2 rounded-full bg-cyan-400"
          />
          <span className="text-xs text-cyan-400 font-bold">ELITE</span>
        </div>
      </div>
      
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-bold">Connected Brokers</p>
            <p className="text-slate-400 text-sm">{connectedCount} of {brokers.length} active</p>
          </div>
          <button
            onClick={syncNow}
            disabled={syncing || connectedCount === 0}
            className={`px-5 py-2 rounded-xl font-bold transition ${
              syncing 
                ? 'bg-cyan-600 text-white animate-pulse' 
                : connectedCount > 0
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {syncing ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Radio className="h-4 w-4" />
                </motion.div>
                Syncing...
              </span>
            ) : (
              'Sync Now'
            )}
          </button>
        </div>
        
        <div className="space-y-2">
          {brokers.map((broker) => (
            <div
              key={broker.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center font-bold text-white">
                  {broker.logo}
                </div>
                <div>
                  <p className="text-white font-bold">{broker.name}</p>
                  <p className={`text-xs ${
                    broker.status === 'connected' ? 'text-emerald-400' :
                    broker.status === 'connecting' ? 'text-yellow-400' :
                    'text-slate-500'
                  }`}>
                    {broker.status === 'connected' ? 'Live' :
                     broker.status === 'connecting' ? 'Connecting...' :
                     'Not connected'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => connectBroker(broker.id)}
                disabled={broker.status === 'connecting'}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  broker.status === 'connected'
                    ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                }`}
              >
                {broker.status === 'connected' ? 'Disconnect' : 
                 broker.status === 'connecting' ? 'Connecting...' : 
                 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {lastSync && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="h-4 w-4" />
          <span>Last synced: {new Date(lastSync).toLocaleString()}</span>
        </div>
      )}
      
      {demoTrades.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Synced Trades</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {demoTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${trade.pnl >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                    {trade.pnl >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold">{trade.symbol}</p>
                    <p className="text-xs text-slate-400">{trade.broker} - {trade.side}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(trade.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}