"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, Calendar, User } from "lucide-react";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "TradingPro_2024", pnl: 24500, winRate: 72, trades: 156, badge: '🥇' },
  { rank: 2, name: "AlphaTrader", pnl: 18900, winRate: 68, trades: 98, badge: '🥈' },
  { rank: 3, name: "ConsistentWins", pnl: 15200, winRate: 65, trades: 234, badge: '🥉' },
  { rank: 4, name: "PriceActionKing", pnl: 12100, winRate: 61, trades: 67, badge: '' },
  { rank: 5, name: "SwingTraderPro", pnl: 9800, winRate: 58, trades: 45, badge: '' },
  { rank: 6, name: "DayTraderElite", pnl: 8200, winRate: 55, trades: 189, badge: '' },
  { rank: 7, name: "TrendFollower", pnl: 6500, winRate: 52, trades: 78, badge: '' },
  { rank: 8, name: "ScalpMaster", pnl: 4200, winRate: 49, trades: 312, badge: '' },
];

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState('week');
  
  const getYourRank = () => 42;
  const getYourStats = () => ({ pnl: 1250, winRate: 58, trades: 23 });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard
          </h2>
          <p className="text-slate-400">Compete with top traders</p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month', 'all'].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-lg text-sm ${
                timeframe === t ? 'bg-blue-600' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ scale: 0.95 }} 
          animate={{ scale: 1 }}
          className="md:col-span-1 glass rounded-xl p-6 border-yellow-500/30"
        >
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-white">Your Rank</span>
          </div>
          <div className="text-4xl font-black text-white mb-2">#{getYourRank()}</div>
          <p className="text-sm text-slate-400 mb-4">Top 15% of traders</p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">This {timeframe}:</span>
              <span className="text-emerald-400">+${getYourStats().pnl}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Win Rate:</span>
              <span className="text-white">{getYourStats().winRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Trades:</span>
              <span className="text-white">{getYourStats().trades}</span>
            </div>
          </div>
        </motion.div>
        
        <div className="md:col-span-2 glass rounded-xl p-6">
          <h3 className="font-bold text-white mb-4">Top Traders This {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}</h3>
          <div className="space-y-3">
            {MOCK_LEADERBOARD.slice(0, 5).map(trader => (
              <motion.div 
                key={trader.rank}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{trader.badge || `#${trader.rank}`}</span>
                  <div>
                    <div className="font-bold text-white">{trader.name}</div>
                    <div className="text-xs text-slate-400">{trader.trades} trades</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${trader.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    +{trader.pnl.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">{trader.winRate}% win</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="glass rounded-xl p-6">
        <h3 className="font-bold text-white mb-4">Monthly Contest</h3>
        <div className="text-center py-4">
          <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-3" />
          <p className="text-slate-300 mb-2">Next prize pool: <span className="font-bold text-yellow-400">$500</span></p>
          <p className="text-sm text-slate-400 mb-4">Ends in 5 days</p>
          <button className="px-6 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-500">
            Join Contest
          </button>
        </div>
      </div>
    </div>
  );
}