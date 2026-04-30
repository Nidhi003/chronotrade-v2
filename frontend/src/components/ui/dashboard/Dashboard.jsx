"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Wallet,
  Settings,
  ChevronsRight,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Target,
  Calendar,
  FileSpreadsheet,
  Cloud,
  Plus,
  Search,
  Download,
  LogOut,
  ChevronRight,
  Loader2,
  HelpCircle,
  Shield,
  Trash2,
  Crown,
  Gem,
  ArrowRight,
  LifeBuoy,
  Flame,
  BarChart3,
  Clock,
  Play,
  Brain,
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import TradeEntryForm from './TradeEntryForm';
import TradeDetailPanel from './TradeDetailPanel';
import JournalPage from "./Journal";
import { PDFReports, MonteCarloSimulation, EliteProDashboard, MarketRegimeTags, MultiAccount } from './features';
import { TradingPsychologyScore, TradeCalendar, SessionAnalysis, BrokerImport, SyncSettings, TierGate, Support } from './features';
import localStorageManager, { loadTradesWithFallback } from '@/lib/storage';
import NotificationsPanel from './features/NotificationsPanel';
import SettingsModal from './features/SettingsModal';
import HelpModal from './features/HelpModal';
import { fetchTrades, addTrade, deleteTrade, updateTrade } from '@/lib/supabase';
import { useSubscription } from '@/context/SubscriptionContext';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const getGlassClass = () => "rounded-[1.75rem] border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 backdrop-blur-2xl";

const getGlassClass2 = () => "rounded-[1.75rem] overflow-hidden border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] backdrop-blur-2xl";

export default function TradingDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { tier, canAccess } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [startingBalance, setStartingBalance] = React.useState(() => {
    const saved = localStorage.getItem('chronotrade_starting_balance');
    const parsed = parseFloat(saved);
    return (!isNaN(parsed) && parsed > 0) ? parsed : 10000;
  });
  const [trades, setTrades] = React.useState([]);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [selectedMenu, setSelectedMenu] = React.useState("Dashboard");
  const [showTradeForm, setShowTradeForm] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const [selectedTrade, setSelectedTrade] = React.useState(null);
  const [userName, setUserName] = React.useState(() => localStorage.getItem('chronotrade_user_name') || '');
  const [brokerConnected, setBrokerConnected] = React.useState(() => localStorage.getItem('chronotrade_broker_connected') === 'true');

  // Initialize from localStorage after mount
  React.useEffect(() => {
    const loadTrades = async () => {
      try {
        const loaded = await loadTradesWithFallback();
        setTrades(Array.isArray(loaded) ? loaded : []);
      } catch (e) {
        console.error('Load error:', e);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };
    loadTrades();
  }, []);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotifications && !e.target.closest('.notifications-panel')) {
        setShowNotifications(false);
      }
      if (showProfileDropdown && !e.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications, showProfileDropdown]);

  // Listen for name-updated event from SettingsModal
  useEffect(() => {
    const handleNameUpdate = () => {
      const storedName = localStorage.getItem('chronotrade_user_name');
      if (storedName !== userName) {
        setUserName(storedName || '');
      }
    };
    window.addEventListener('name-updated', handleNameUpdate);
    return () => window.removeEventListener('name-updated', handleNameUpdate);
  }, [userName]);

  // Load trades from local storage (instant load)
  useEffect(() => {
    const loadTrades = async () => {
      try {
        const loaded = await loadTradesWithFallback();
        setTrades(Array.isArray(loaded) ? loaded : []);
      } catch (e) {
        console.error('Load error:', e);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTrades();
  }, []);

  useEffect(() => {
    const handleImportTrades = (event) => {
      const importedTrades = Array.isArray(event.detail) ? event.detail : [];
      if (!importedTrades.length) return;

      const savedTrades = importedTrades.map((trade) => localStorageManager.addTrade({
        ...trade,
        status: trade.status || ((trade.pnl || 0) >= 0 ? "WIN" : "LOSS"),
      }));

      setTrades((prev) => [...savedTrades, ...prev]);
      setSelectedMenu("Dashboard");
    };

    window.addEventListener('importTrades', handleImportTrades);
    return () => window.removeEventListener('importTrades', handleImportTrades);
  }, []);

  // Calculate current account balance from trades
  const accountBalance = React.useMemo(() => {
    const totalPnl = trades.reduce((sum, trade) => sum + (parseFloat(trade.pnl) || 0), 0);
    return startingBalance + totalPnl;
  }, [trades, startingBalance]);

  // Calculate equity curve from trades
  const equityData = React.useMemo(() => {
    if (!trades || !trades.length) return [{ date: "Now", value: startingBalance }];
    
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    
    let cumulative = startingBalance;
    return sortedTrades.slice(0, 15).map(t => {
      cumulative += t.pnl || 0;
      return { 
        date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        value: cumulative 
      };
    });
  }, [trades, startingBalance]);

  // Calculate strategy data from actual trades
  const strategyData = React.useMemo(() => {
    const strategies = {};
    trades.forEach(t => {
      const s = t.strategy || 'Other';
      if (!strategies[s]) strategies[s] = { count: 0, wins: 0, pnl: 0 };
      strategies[s].count++;
      if (t.pnl > 0) strategies[s].wins++;
      strategies[s].pnl += t.pnl || 0;
    });
    return Object.entries(strategies).map(([name, data], i) => ({
      name,
      value: data.count,
      color: ['#facc15', '#f59e0b', '#fde047', '#d97706', '#fef08a'][i % 5]
    }));
  }, [trades]);

  // Calculate today's stats
  const { todayTrades, todayPnl, todayWinRate, bestTrade, bestDay } = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = trades.filter(t => {
      const tradeDate = new Date(t.created_at).toISOString().split('T')[0];
      return tradeDate === today;
    });
    const todayPnl = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const todayWinRate = todayTrades.length ? Math.round((todayTrades.filter(t => (t.pnl || 0) > 0).length / todayTrades.length * 100)) : 0;
    const bestTrade = todayTrades.length ? Math.max(...todayTrades.map(t => t.pnl || 0)) : 0;
    
    const dailyPnl = {};
    trades.forEach(t => {
      const date = new Date(t.created_at).toISOString().split('T')[0];
      if (!dailyPnl[date]) dailyPnl[date] = 0;
      dailyPnl[date] += t.pnl || 0;
    });
    const days = Object.entries(dailyPnl).sort((a, b) => b[1] - a[1]);
    const bestDay = days[0] ? { date: days[0][0], pnl: days[0][1] } : { date: 'N/A', pnl: 0 };
    
    return {
      todayTrades: todayTrades.length,
      todayPnl: todayPnl.toFixed(0),
      todayWinRate: todayWinRate,
      bestTrade: bestTrade.toFixed(0),
      bestDay
    };
  }, [trades]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-yellow-300 animate-spin" />
          <p className="text-zinc-500">Loading your trading desk...</p>
        </div>
      </div>
    );
  }

  const handleTradeAdded = (newTrade) => {
    const trade = {
      symbol: String(newTrade.symbol || '').toUpperCase().slice(0, 20),
      side: newTrade.side === 'SHORT' ? 'SHORT' : 'LONG',
      pnl: parseFloat(newTrade.pnl) || 0,
      riskAmount: parseFloat(newTrade.riskAmount) || 0,
      strategy: newTrade.strategy || '',
      timeframe: newTrade.timeframe || '',
      notes: newTrade.notes || '',
      confidence: newTrade.confidence || 'medium',
      status: parseFloat(newTrade.pnl) >= 0 ? 'WIN' : 'LOSS',
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
      created_at: new Date().toISOString(),
      synced: false
    };
    
    const trades = localStorageManager.getTrades();
    trades.unshift(trade);
    localStorageManager.saveTrades(trades);
    setTrades(trades);
    setShowTradeForm(false);
  };

  const handleDeleteTrade = async (tradeId) => {
    if (!confirm("Delete this trade?")) return;
    
    // Delete from local storage
    const trades = localStorageManager.getTrades();
    const filtered = trades.filter(t => t.id !== tradeId);
    localStorageManager.saveTrades(filtered);
    setTrades(filtered);
    
    // Try cloud delete too
    try {
      await deleteTrade(tradeId);
    } catch (e) {
      console.warn('Cloud delete failed, local delete saved');
    }
  };

  const handleUpdateTrade = async (tradeId, updates) => {
    // Update locally
    localStorageManager.updateTrade(tradeId, updates);
    setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, ...updates } : t));
    // Try server update
    try { await updateTrade(tradeId, updates); } catch (e) { console.error('Server update failed:', e); }
    setSelectedTrade(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="chrono-brand-shell flex h-dvh w-full selection:bg-yellow-300/30 text-white bg-[#050505] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        selected={selectedMenu}
        setSelected={setSelectedMenu}
        onLogout={handleLogout}
        theme={theme}
        tier={tier}
      />

      <main className="flex-1 min-w-0 h-dvh overflow-y-auto overflow-x-hidden">
        {/* Floating Log Trade Button */}
        <button
          onClick={() => setShowTradeForm(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-yellow-300 px-6 py-4 text-black font-bold shadow-lg hover:bg-yellow-200 transition hover:scale-105"
        >
          <span className="text-xl">+</span> Log Trade
        </button>
        
        <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
            theme={theme} 
            accountBalance={accountBalance}
            startingBalance={startingBalance}
            setStartingBalance={setStartingBalance}
            brokerConnected={brokerConnected}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            showProfileDropdown={showProfileDropdown}
            setShowProfileDropdown={setShowProfileDropdown}
            setShowSettings={setShowSettings}
            setShowHelp={setShowHelp}
            user={user}
            userName={userName}
            setUserName={setUserName}
            tier={tier}
            navigate={navigate}
            onLogout={handleLogout}
          />

        <div className="p-4 md:p-8">
          {selectedMenu === "Dashboard" && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Upgrade Banner for free users */}
              {tier === 'free' && (
                <motion.div variants={itemVariants} className="upgrade-banner rounded-[1.8rem] border border-yellow-200/15 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 shadow-[0_12px_30px_rgba(250,204,21,0.2)]">
                      <Crown className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Upgrade to Pro or Elite</div>
                      <div className="text-xs text-zinc-400 mt-0.5">Unlock analytics, Monte Carlo, trade calendar, PDF reports, and more</div>
                    </div>
                  </div>
                  <button onClick={() => navigate('/subscribe')} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 px-6 py-2.5 text-sm font-bold uppercase tracking-[0.18em] text-black shadow-[0_12px_30px_rgba(250,204,21,0.16)] transition-all hover:shadow-[0_16px_40px_rgba(250,204,21,0.22)] active:scale-95 whitespace-nowrap">
                    <Gem className="h-4 w-4" /> Upgrade
                  </button>
                </motion.div>
              )}

              <CommandCenterPanel />

              <StatsCards trades={trades} theme={theme} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                  variants={itemVariants}
                  className="lg:col-span-2 rounded-[1.75rem] border border-yellow-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Equity Curve</h3>
                      <p className="text-sm text-zinc-500">Net cumulative performance (USD)</p>
                    </div>
<div className="flex gap-2">
                        <button className="p-2 rounded-lg transition-colors bg-white/[0.04] hover:bg-white/[0.08]">
                         <Download className="h-4 w-4 text-zinc-300" />
                       </button>
                       <select className="rounded-lg text-xs px-3 py-2 outline-none bg-white/[0.04] text-zinc-300">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ minHeight: '200px', height: '300px' }} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={equityData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fde047" stopOpacity={0.32}/>
                            <stop offset="95%" stopColor="#fde047" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#71717a', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#71717a', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0b0b0b",
                            border: "1px solid rgba(253,224,71,0.12)",
                            borderRadius: "12px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#fde047"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className={getGlassClass(theme)}
                >
                  <h3 className="text-xl font-bold tracking-tight mb-2">Quick Stats</h3>
                  <p className="text-sm text-zinc-500 mb-6">Today's performance</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-xs text-zinc-500 mb-1">Today Trades</div>
                      <div className="text-2xl font-black">{todayTrades}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-xs text-zinc-500 mb-1">Today P&L</div>
                      <div className={`text-2xl font-black ${todayPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {todayPnl >= 0 ? "+" : ""}${todayPnl}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-xs text-zinc-500 mb-1">Win Rate</div>
                      <div className="text-2xl font-black">{todayWinRate}%</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-xs text-zinc-500 mb-1">Best Trade</div>
                      <div className="text-2xl font-black text-emerald-400">+${bestTrade}</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">Best Day</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {bestDay.date}: {bestDay.pnl >= 0 ? "+" : ""}${bestDay.pnl}
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                variants={itemVariants}
                className={getGlassClass2(theme)}
              >
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Trade Ledger</h3>
                    <p className="text-sm text-zinc-500">Review every execution, setup, and result in one place</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative hidden sm:block">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search symbol, setup, or note..."
                        className="pl-10 pr-4 py-2 rounded-xl bg-black/35 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300/30 transition-all w-64"
                      />
                    </div>
                    <button
                      onClick={() => setShowTradeForm(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 text-black font-bold transition-all shadow-[0_18px_50px_rgba(250,204,21,0.18)] active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Log Trade</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.03]">
                        <th className="py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Asset</th>
                        <th className="py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Direction</th>
                        <th className="py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Strategy</th>
                        <th className="py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">P&L</th>
                        <th className="py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                        <th className="py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Timestamp</th>
                        <th className="py-4 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {trades.map((trade) => (
                        <motion.tr
                          key={trade.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setSelectedTrade(trade)}
                          className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-yellow-300/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-yellow-200">{trade.symbol.substring(0, 2)}</span>
                              </div>
                              <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{trade.symbol}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                                trade.side === "LONG"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {trade.side === "LONG" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {trade.side}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-400 font-medium">{trade.strategy}</td>
                          <td className={`py-4 px-6 text-sm font-bold text-right ${trade.pnl > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {trade.pnl > 0 ? "+" : ""}${Math.abs(trade.pnl).toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                trade.status === "WIN"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {trade.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                            {trade.created_at ? new Date(trade.created_at).toLocaleString() : 'Just now'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteTrade(trade.id); }}
                              className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                              title="Delete trade"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

{selectedMenu === "Journal" && <JournalPage />}
          
          {selectedMenu === "Analytics" && (
            <TierGate feature="analytics" tierRequired="pro">
              <EliteProDashboard trades={trades} tier={tier} />
            </TierGate>
          )}
          
          {selectedMenu === "Systems" && (
            <TierGate feature="monteCarlo" tierRequired="pro">
              <MonteCarloSimulation trades={trades} />
            </TierGate>
          )}
          
          {selectedMenu === "Psychology" && (
            <TierGate feature="psychology" tierRequired="elite">
              <TradingPsychologyScore trades={trades} />
            </TierGate>
          )}
          
{selectedMenu === "Calendar" && (
              <TierGate feature="tradeCalendar" tierRequired="pro">
<TradeCalendar trades={trades} />
              </TierGate>
          )}
          
          {selectedMenu === "Import" && (
            <TierGate feature="brokerImport" tierRequired="pro">
              <BrokerImport />
            </TierGate>
          )}

          {selectedMenu === "Reports" && (
            <TierGate feature="pdfReports" tierRequired="pro">
              <PDFReports trades={trades} />
            </TierGate>
          )}

          {selectedMenu === "Setups" && (
            <TierGate feature="setupPerformance" tierRequired="pro">
              <MarketRegimeTags trades={trades} />
            </TierGate>
          )}

          {selectedMenu === "Accounts" && (
            <TierGate feature="multiAccount" tierRequired="elite">
              <MultiAccount trades={trades} />
            </TierGate>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showTradeForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-auto"
            >
              <TradeEntryForm
                onClose={() => setShowTradeForm(false)}
                onTradeAdded={handleTradeAdded}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTrade && (
          <TradeDetailPanel
            trade={selectedTrade}
            onClose={() => setSelectedTrade(null)}
            onSave={handleUpdateTrade}
          />
        )}
      </AnimatePresence>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        theme={theme}
        onNameChange={(newName) => setUserName(newName)}
      />

      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
        theme={theme}
      />
    </div>
  );
}

const CommandCenterPanel = () => {
  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-2xl border border-yellow-200/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_30%),linear-gradient(135deg,rgba(250,204,21,0.10),rgba(255,255,255,0.035)_38%,rgba(0,0,0,0.38))] p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-200/70">ChronoTradez</div>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Track trades. View calendar. Improve.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { label: "Journal", icon: BookOpen },
            { label: "Calendar", icon: Calendar },
            { label: "Analytics", icon: BarChart3 },
            { label: "Streaks", icon: Flame },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <Icon className="h-4 w-4 text-yellow-200" />
                <span className="text-sm text-zinc-300">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// -------------------------------------------------------------------------
// SIDEBAR COMPONENT
// -------------------------------------------------------------------------
const Sidebar = ({ open, setOpen, selected, setSelected, onLogout, theme, tier = 'free' }) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: BookOpen, label: "Journal" },
    { icon: Calendar, label: "Calendar", tier: "pro" },
    { icon: BarChart3, label: "Analytics", tier: "pro" },
    { icon: Download, label: "Reports", tier: "pro" },
    { icon: Target, label: "Setups", tier: "pro" },
    { icon: Brain, label: "Psychology", tier: "elite" },
    { icon: Wallet, label: "Accounts", tier: "elite" },
  ];

  return (
    <motion.nav
      initial={false}
      animate={{ width: open ? 200 : 64, x: open ? 0 : -200 }}
      className="fixed lg:relative flex flex-col h-dvh border-r z-50 lg:z-40 transition-all duration-300 ease-in-out left-0 lg:left-0 overflow-y-auto glass-dark border-white/5"
    >
      {/* Logo */}
      <div className="p-3 mb-2 shrink-0 flex items-center justify-center">
        <div className="size-8 shrink-0 rounded-xl bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 50 39" fill="none" className="fill-white">
            <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" />
            <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" />
          </svg>
        </div>
        {open && (
          <div className="ml-3 overflow-hidden whitespace-nowrap">
            <span className="block text-base font-bold text-white">ChronoTradez</span>
          </div>
        )}
      </div>

      {/* Menu Items - Minimal icons */}
      <div className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = selected === item.label;
          const isLocked = item.tier && tier === 'free';
           
          return (
            <button
              key={item.label}
              onClick={() => setSelected(item.label)}
              className={`group relative flex items-center h-10 w-full rounded-lg transition-all duration-200 ${
                open ? 'justify-start pl-3' : 'justify-center'
              } ${
                isActive
                  ? "bg-yellow-200 text-black"
                  : isLocked
                    ? "text-zinc-400 hover:text-zinc-300"
                    : "text-white hover:bg-white/5 hover:text-white"
              }`}
              title={item.label}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isLocked ? 'opacity-40' : ''}`} />
              {open && (
                <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              {isLocked && !open && (
                <span className="absolute top-0 right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2 mt-auto shrink-0 border-t border-white/5">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center h-10 w-full rounded-lg text-zinc-500 hover:bg-white/5 transition-all"
        >
          <ChevronsRight className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
    </motion.nav>
  );
};

// -------------------------------------------------------------------------
// HEADER COMPONENT
// -------------------------------------------------------------------------
const Header = ({ onMenuClick, theme, accountBalance, startingBalance = 10000, setStartingBalance, brokerConnected, showNotifications, setShowNotifications, showProfileDropdown, setShowProfileDropdown, setShowSettings, setShowHelp, user, userName, setUserName, tier, navigate, onLogout }) => {
  const [showBalanceEdit, setShowBalanceEdit] = React.useState(false);
  const [editBalance, setEditBalance] = React.useState(() => {
    if (typeof startingBalance === 'number' && startingBalance > 0) return startingBalance;
    const saved = parseFloat(localStorage.getItem('chronotrade_starting_balance'));
    return saved || 10000;
  });

  const handleSaveBalance = () => {
    setStartingBalance(parseFloat(editBalance) || 10000);
    localStorage.setItem('chronotrade_starting_balance', editBalance.toString());
    setShowBalanceEdit(false);
  };
  const iconButtonClass = "rounded-2xl border border-yellow-200/10 bg-white/[0.03] p-2.5 transition-all hover:bg-white/[0.06]";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 md:h-20 px-4 md:px-8 backdrop-blur-xl border-b bg-[#050505]/88 border-yellow-200/10">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg transition-all glass hover:bg-white/10"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="h-8 w-1 bg-yellow-300 rounded-full" />
        <div>
          <h2 className="text-lg font-bold tracking-tight">Trading Desk</h2>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Journal
          </div>
          <div className="mt-1 flex items-center gap-2">
            {showBalanceEdit ? (
              <div className="flex items-center gap-1">
                <input 
                  type="number"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-24 px-2 py-0.5 text-xs bg-black/50 border border-yellow-300/30 rounded text-yellow-300 font-mono"
                  autoFocus
                />
                <button onClick={handleSaveBalance} className="text-emerald-400 hover:text-emerald-300">
                  <Check className="h-3 w-3" />
                </button>
                <button onClick={() => setShowBalanceEdit(false)} className="text-rose-400 hover:text-rose-300">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setEditBalance(startingBalance); setShowBalanceEdit(true); }}
                className="text-[10px] text-yellow-400/70 hover:text-yellow-300 font-mono flex items-center gap-1"
              >
                Starting: ${startingBalance.toLocaleString()}
                <Pencil className="h-2.5 w-2.5" />
              </button>
            )}
            <span className="text-[10px] text-zinc-600">|</span>
            <span className="text-[10px] text-emerald-400 font-mono">
              Current: ${accountBalance.toLocaleString()}
            </span>
          </div>
        </div>
        
      </div>

      <div className="flex items-center gap-3">
          {/* Upgrade Button - Always visible for free users, or show tier badge for paid */}
          {tier === 'free' ? (
            <button 
              onClick={() => navigate('/subscribe')}
              className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black shadow-[0_12px_30px_rgba(250,204,21,0.16)] transition-all hover:shadow-[0_16px_40px_rgba(250,204,21,0.22)] active:scale-95"
            >
              <Crown className="h-4 w-4" />
              Upgrade
            </button>
          ) : (
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.16em] ${
              tier === 'elite' ? 'bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 text-black' :
              tier === 'pro' ? 'bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 text-black' :
              'bg-slate-500/20 text-slate-400'
            }`}>
              {tier === 'elite' ? <Gem className="h-3.5 w-3.5" /> : <Crown className="h-3.5 w-3.5" />}
              {tier}
            </div>
          )}
          
          {/* Bell Icon */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`notifications-panel relative ${iconButtonClass} group`}
          >
            <Bell className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            <span className="absolute top-2.5 right-2.5 size-2 bg-yellow-300 rounded-full border-2 border-[#050505]" />
          </button>
          <AnimatePresence>
            {showNotifications && (
              <NotificationsPanel 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)}
                theme={theme}
              />
            )}
          </AnimatePresence>

        {/* Profile Button */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`profile-dropdown flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400`}
          >
            <div className="w-7 h-7 rounded-md bg-black/15 flex items-center justify-center">
              <span className="text-xs font-bold text-black">{(userName?.[0])?.toUpperCase() || 'U'}</span>
            </div>
            <span className="text-xs font-medium text-black hidden sm:inline max-w-[80px] truncate">
              {userName || 'User'}
            </span>
          </button>
          
          {showProfileDropdown && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden bg-[#0a0a0a] border border-yellow-200/10"
              style={{ zIndex: 100 }}
            >
              <div className="p-4 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_45%)]">
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-[0.16em] ${
                    tier === 'elite' ? 'bg-amber-300/20 text-amber-100' :
                    tier === 'pro' ? 'bg-yellow-300/20 text-yellow-200' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    Test Build
                  </span>
                </div>
              </div>
              
              <div className="p-2">
                <button 
                  onClick={() => { setShowSettings(true); setShowProfileDropdown(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-white/[0.04]"
                >
                  <Settings className="size-5 text-yellow-200" />
                  <span className="text-sm text-white">Settings</span>
                </button>
                <button 
                  onClick={() => { setShowHelp(true); setShowProfileDropdown(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-white/[0.04]"
                >
                  <HelpCircle className="size-5 text-yellow-200" />
                  <span className="text-sm text-white">Help & Support</span>
                </button>
              </div>
              
              <div className="p-2 border-t border-white/10">
                <button 
                  onClick={() => { onLogout(); setShowProfileDropdown(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="size-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// -------------------------------------------------------------------------
// STATS CARDS COMPONENT
// -------------------------------------------------------------------------
const StatsCards = ({ trades = [], theme = 'dark' }) => {
  // Calculate real stats from trades
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = trades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = trades.length ? ((wins / trades.length) * 100).toFixed(1) : '0';
  const currentStreak = React.useMemo(() => {
    let streak = 0;
    for (const t of trades) {
      if ((t.pnl || 0) > 0) streak++;
      else break;
    }
    return streak;
  }, [trades]);
  
  // Calculate Risk to Reward ratio from trades with risk data
  const tradesWithRisk = trades.filter(t => (t.riskAmount || 0) > 0 && (t.pnl || 0) !== 0);
  let avgRR = '0';
  
  if (tradesWithRisk.length > 0) {
    const rrValues = tradesWithRisk.map(t => {
      const risk = Math.abs(t.riskAmount || 0);
      return risk > 0 ? (t.pnl || 0) / risk : 0;
    });
    const validRR = rrValues.filter(v => v !== 0);
    if (validRR.length > 0) {
      const sumRR = validRR.reduce((a, b) => a + b, 0);
      avgRR = (sumRR / validRR.length).toFixed(1);
    }
  }

  const stats = [
    {
      title: "Starting Balance",
      value: `$${startingBalance.toLocaleString()}`,
      change: "",
      isPositive: true,
      icon: DollarSign,
      iconWrap: "bg-blue-400/10 border border-blue-300/20",
      iconClass: "text-blue-200",
    },
    {
      title: "Current Balance",
      value: `$${accountBalance.toLocaleString()}`,
      change: "",
      isPositive: true,
      icon: DollarSign,
      iconWrap: "bg-emerald-400/10 border border-emerald-300/20",
      iconClass: "text-emerald-200",
    },
    {
      title: "Portfolio P&L",
      value: `$${totalPnl.toLocaleString()}`,
      change: totalPnl >= 0 ? "+" : "",
      isPositive: totalPnl >= 0,
      icon: DollarSign,
      iconWrap: "bg-yellow-300/10 border border-yellow-300/20",
      iconClass: "text-yellow-200",
    },
    {
      title: "Win Rate",
      value: `${winRate}%`,
      change: "",
      isPositive: parseFloat(winRate) >= 50,
      icon: Target,
      iconWrap: "bg-amber-400/10 border border-amber-300/20",
      iconClass: "text-amber-200",
    },
    {
      title: "Risk:Reward",
      value: `${avgRR}R`,
      change: "",
      isPositive: parseFloat(avgRR) >= 1.5,
      icon: Activity,
      iconWrap: "bg-yellow-300/10 border border-yellow-300/20",
      iconClass: "text-yellow-200",
    },
    {
      title: "Winning Streak",
      value: `${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`,
      change: "",
      isPositive: true,
      icon: Calendar,
      iconWrap: "bg-amber-400/10 border border-amber-300/20",
      iconClass: "text-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className={`${theme === 'dark' ? 'glass' : 'border border-white/10'} rounded-2xl p-6 group cursor-pointer relative overflow-hidden`}
        >
          {/* Subtle background glow */}
          <div className="absolute -right-4 -top-4 size-24 bg-yellow-300 blur-3xl opacity-0 transition-opacity group-hover:opacity-20" />
          
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${stat.iconWrap}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconClass}`} />
            </div>
            <span
              className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg ${
                stat.isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {stat.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {stat.change}
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.title}</h3>
          <p className="text-2xl font-black text-white">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
};
