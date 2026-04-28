"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, X, TrendingUp, TrendingDown, Calendar } from "lucide-react";

export default function TradeFilters({ trades, onFilter }) {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    symbol: "",
    side: "",
    strategy: "",
    dateFrom: "",
    dateTo: "",
    minPnl: "",
    maxPnl: "",
    status: ""
  });

  const symbols = [...new Set(trades.map(t => t.symbol).filter(Boolean))];
  const strategies = [...new Set(trades.map(t => t.strategy).filter(Boolean))];

  const applyFilters = () => {
    let filtered = [...trades];

    // Search
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(t => 
        (t.symbol?.toLowerCase().includes(s)) ||
        (t.strategy?.toLowerCase().includes(s)) ||
        (t.notes?.toLowerCase().includes(s))
      );
    }

    // Symbol
    if (filters.symbol) {
      filtered = filtered.filter(t => t.symbol === filters.symbol);
    }

    // Side
    if (filters.side) {
      filtered = filtered.filter(t => t.side === filters.side);
    }

    // Strategy
    if (filters.strategy) {
      filtered = filtered.filter(t => t.strategy === filters.strategy);
    }

    // Date range
    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.created_at) <= new Date(filters.dateTo));
    }

    // P&L range
    if (filters.minPnl) {
      filtered = filtered.filter(t => (t.pnl || 0) >= parseFloat(filters.minPnl));
    }
    if (filters.maxPnl) {
      filtered = filtered.filter(t => (t.pnl || 0) <= parseFloat(filters.maxPnl));
    }

    // Status
    if (filters.status) {
      if (filters.status === "win") {
        filtered = filtered.filter(t => (t.pnl || 0) > 0);
      } else if (filters.status === "loss") {
        filtered = filtered.filter(t => (t.pnl || 0) < 0);
      }
    }

    onFilter(filtered);
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({
      symbol: "",
      side: "",
      strategy: "",
      dateFrom: "",
      dateTo: "",
      minPnl: "",
      maxPnl: "",
      status: ""
    });
    onFilter(trades);
  };

  const activeFilters = Object.values(filters).filter(v => v).length + (search ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              applyFilters();
            }}
            placeholder="Search trades..."
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl border transition ${
            showFilters || activeFilters > 0
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'glass border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Filter className="h-5 w-5" />
          {activeFilters > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-xs flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass rounded-xl p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">Filters</h3>
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-rose-400 hover:text-rose-300"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Symbol */}
            <div>
              <label className="text-xs text-slate-400">Symbol</label>
              <select
                value={filters.symbol}
                onChange={(e) => {
                  setFilters({ ...filters, symbol: e.target.value });
                  applyFilters();
                }}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
              >
                <option value="">All</option>
                {symbols.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Side */}
            <div>
              <label className="text-xs text-slate-400">Direction</label>
              <select
                value={filters.side}
                onChange={(e) => {
                  setFilters({ ...filters, side: e.target.value });
                  applyFilters();
                }}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
              >
                <option value="">All</option>
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>

            {/* Strategy */}
            <div>
              <label className="text-xs text-slate-400">Strategy</label>
              <select
                value={filters.strategy}
                onChange={(e) => {
                  setFilters({ ...filters, strategy: e.target.value });
                  applyFilters();
                }}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
              >
                <option value="">All</option>
                {strategies.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs text-slate-400">Result</label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  applyFilters();
                }}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
              >
                <option value="">All</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => {
                  setFilters({ ...filters, dateFrom: e.target.value });
                  applyFilters();
                }}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => {
                  setFilters({ ...filters, dateTo: e.target.value });
                  applyFilters();
                }}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
              />
            </div>
          </div>

          {/* P&L Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Min P&L</label>
              <input
                type="number"
                value={filters.minPnl}
                onChange={(e) => {
                  setFilters({ ...filters, minPnl: e.target.value });
                  applyFilters();
                }}
                placeholder="-100"
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Max P&L</label>
              <input
                type="number"
                value={filters.maxPnl}
                onChange={(e) => {
                  setFilters({ ...filters, maxPnl: e.target.value });
                  applyFilters();
                }}
                placeholder="100"
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white mt-1"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFilters({ ...filters, status: "win" });
                applyFilters();
              }}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm flex items-center gap-1"
            >
              <TrendingUp className="h-4 w-4" /> Wins
            </button>
            <button
              onClick={() => {
                setFilters({ ...filters, status: "loss" });
                applyFilters();
              }}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-sm flex items-center gap-1"
            >
              <TrendingDown className="h-4 w-4" /> Losses
            </button>
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setFilters({ ...filters, dateFrom: today });
                applyFilters();
              }}
              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" /> Today
            </button>
            <button
              onClick={() => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                setFilters({ ...filters, dateFrom: weekAgo.toISOString().split('T')[0] });
                applyFilters();
              }}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm"
            >
              This Week
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}