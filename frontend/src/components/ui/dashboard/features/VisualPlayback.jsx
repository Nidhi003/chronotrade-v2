"use client";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Play, Pause, RotateCcw, TrendingUp, TrendingDown, 
  Activity, Clock, BarChart3, Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function VisualPlayback({ trades = [] }) {
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);

  useEffect(() => {
    if (!selectedTrade && trades.length) {
      setSelectedTrade(trades[0]);
      setPlaybackIndex(20);
    }
  }, [selectedTrade, trades]);
  
  // Generate simulated price data for each trade
  const generatePriceData = (trade) => {
    const data = [];
    const entry = parseFloat(trade.entry_price ?? trade.entryPrice ?? 0);
    const exit = parseFloat(trade.exit_price ?? trade.exitPrice ?? entry);
    const direction = trade.side === "LONG" ? 1 : -1;
    const volatility = Math.abs(exit - entry) * 0.3;
    
    // Entry point
    let price = entry;
    for (let i = 0; i <= 20; i++) {
      const progress = i / 20;
      if (i === 0) {
        price = entry;
      } else if (i <= 10) {
        // First half - move toward entry with some noise
        price = entry + (exit - entry) * progress * 0.8 + (Math.random() - 0.5) * volatility;
      } else {
        // Second half - move toward exit
        price = exit * 0.2 + entry * 0.8 + (exit - entry) * progress * 0.2 + (Math.random() - 0.5) * volatility * 0.5;
      }
      data.push({
        time: `${i * 5}m`,
        price: price.toFixed(2),
        marker: i === 0 ? "ENTRY" : i === 20 ? "EXIT" : null
      });
    }
    return data;
  };
  
  const handlePlay = () => {
    setIsPlaying(true);
    setPlaybackIndex(0);
    
    const interval = setInterval(() => {
      setPlaybackIndex(prev => {
        if (prev >= 20) {
          setIsPlaying(false);
          clearInterval(interval);
          return 20;
        }
        return prev + 1;
      });
    }, 300);
  };
  
  const handleReset = () => {
    setPlaybackIndex(0);
    setIsPlaying(false);
  };

  const playbackData = useMemo(() => {
    if (!selectedTrade) return [];
    return generatePriceData(selectedTrade);
  }, [selectedTrade]);
  
  if (!trades.length) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Add trades to see visual playback</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Visual Playback</h2>
        <p className="text-slate-400">See your trades unfold in real-time</p>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {trades.slice(0, 10).map((trade, i) => (
          <button
            key={trade.id || i}
            onClick={() => {
              setSelectedTrade(trade);
              setPlaybackIndex(20);
            }}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm ${
              selectedTrade?.id === trade.id
                ? 'bg-yellow-300 text-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {trade.symbol}
          </button>
        ))}
      </div>
      
      {selectedTrade && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedTrade.symbol}</h3>
              <p className="text-slate-400">{selectedTrade.strategy} • {selectedTrade.side}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePlay}
                disabled={isPlaying}
                className="p-2 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 text-black rounded-lg hover:brightness-105 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={playbackData.slice(0, playbackIndex + 1)}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.32}/>
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b0b0b', border: '1px solid rgba(250,204,21,0.18)', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#facc15" 
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={(props) => {
                    if (props.payload.marker) {
                      return (
                        <circle 
                          cx={props.cx} 
                          cy={props.cy} 
                          r={4} 
                          fill={props.payload.marker === "ENTRY" ? "#10b981" : "#ef4444"}
                        />
                      );
                    }
                    return null;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-400">Entry: ${selectedTrade.entry_price ?? selectedTrade.entryPrice}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-sm text-slate-400">Exit: ${selectedTrade.exit_price ?? selectedTrade.exitPrice}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${selectedTrade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedTrade.pnl >= 0 ? '+' : ''}${selectedTrade.pnl}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
