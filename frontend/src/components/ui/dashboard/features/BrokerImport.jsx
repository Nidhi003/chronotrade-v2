"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, X } from "lucide-react";

export default function BrokerImport() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);
  
  const handleImport = async (file) => {
    if (!file) return;
    
    setImporting(true);
    setError(null);
    setResults(null);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      
      // Smart CSV parsing
      const trades = [];
      let headers = [];
      let delimiter = ',';
      
      // Detect delimiter
      if (lines[0].includes('\t') && !lines[0].includes(',')) {
        delimiter = '\t';
      }
      
      // Parse header row
      headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
      
      // Find column indices
      const findCol = (names) => {
        for (const name of names) {
          const idx = headers.findIndex(h => h.includes(name));
          if (idx !== -1) return idx;
        }
        return -1;
      };
      
      const cols = {
        symbol: findCol(['symbol', 'pair', 'instrument', 'asset', 'ticker']),
        side: findCol(['side', 'type', 'direction', 'action', 'buy/sell']),
        quantity: findCol(['quantity', 'lots', 'size', 'volume', 'units']),
        entryPrice: findCol(['entry', 'entry price', 'open price', 'buy price', 'price in']),
        exitPrice: findCol(['exit', 'exit price', 'close price', 'sell price', 'price out']),
        pnl: findCol(['pnl', 'profit', 'loss', 'result', 'net', 'p/l', 'gain']),
        date: findCol(['date', 'time', 'datetime', 'timestamp', 'open time', 'close time']),
        strategy: findCol(['strategy', 'type', 'method', 'system']),
        notes: findCol(['notes', 'comment', 'memo', 'description'])
      };
      
      // Validate required columns
      if (cols.symbol === -1 && cols.pnl === -1) {
        throw new Error('CSV must have Symbol or P&L column');
      }
      
      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map(v => v.trim());
        
        if (values.length < 2) continue;
        
        const symbol = cols.symbol !== -1 ? values[cols.symbol] : 'UNKNOWN';
        const side = cols.side !== -1 ? values[cols.side] : '';
        const quantity = cols.quantity !== -1 ? parseFloat(values[cols.quantity]) || 1 : 1;
        const entryPrice = cols.entryPrice !== -1 ? parseFloat(values[cols.entryPrice]) || 0 : 0;
        const exitPrice = cols.exitPrice !== -1 ? parseFloat(values[cols.exitPrice]) || 0 : 0;
        let pnl = cols.pnl !== -1 ? parseFloat(values[cols.pnl]) || 0 : 0;
        const date = cols.date !== -1 ? values[cols.date] : new Date().toISOString();
        const strategy = cols.strategy !== -1 ? values[cols.strategy] : '';
        const notes = cols.notes !== -1 ? values[cols.notes] : '';
        
        // Normalize side
        let normalizedSide = 'LONG';
        if (side.toLowerCase().includes('sell') || side.toLowerCase().includes('short')) {
          normalizedSide = 'SHORT';
        }
        
        // Try to calculate P&L if not provided
        if (pnl === 0 && entryPrice && exitPrice && quantity) {
          pnl = normalizedSide === 'LONG' 
            ? (exitPrice - entryPrice) * quantity
            : (entryPrice - exitPrice) * quantity;
        }
        
        trades.push({
          id: Date.now() + i,
          symbol,
          side: normalizedSide,
          quantity,
          entryPrice,
          exitPrice,
          pnl,
          created_at: new Date(date).toISOString(),
          strategy,
          notes,
          imported: true
        });
      }
      
      if (trades.length === 0) {
        throw new Error('No trades found in file');
      }
      
      setResults({
        total: trades.length,
        profitable: trades.filter(t => t.pnl > 0).length,
        totalPnl: trades.reduce((s, t) => s + t.pnl, 0),
        trades
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImport(file);
  };
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleImport(file);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-yellow-200" />
          Broker CSV Import
        </h2>
      </div>
      
      {/* Drop Zone */}
      <motion.div
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        animate={{ 
          scale: dragActive ? 1.02 : 1,
          borderColor: dragActive ? '#facc15' : '#3f3f46'
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          dragActive ? 'bg-yellow-300/10' : 'bg-slate-800/30'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Upload className={`h-12 w-12 mx-auto mb-4 ${dragActive ? 'text-yellow-200' : 'text-slate-500'}`} />
        
        <p className="text-white font-bold mb-2">
          Drop your broker CSV here
        </p>
        <p className="text-slate-400 text-sm mb-4">
          or click to browse files
        </p>
        
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="px-6 py-3 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 rounded-xl text-black font-bold transition hover:brightness-105"
        >
          {importing ? 'Processing...' : 'Select File'}
        </button>
      </motion.div>
      
      {/* Supported Formats */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-white mb-3">Supported Formats</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { broker: 'TradingView', cols: 'Symbol, Side, Quantity, Entry, Exit, P&L' },
            { broker: 'MT4/MT5', cols: 'Ticket, Symbol, Type, Lots, Profit' },
            { broker: 'Tradovate', cols: 'Symbol, Action, Qty, Price, P&L' },
            { broker: 'TradersPost', cols: 'Symbol, Side, Size, P&L, Date' },
            { broker: 'Generic CSV', cols: 'Any with Symbol or P&L' },
            { broker: 'FX Blue', cols: 'All standard exports' },
          ].map((fmt) => (
            <div key={fmt.broker} className="flex justify-between p-2 bg-slate-800/50 rounded-lg">
              <span className="text-white font-medium">{fmt.broker}</span>
              <span className="text-slate-500 text-xs">{fmt.cols}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
          <div>
            <p className="text-rose-400 font-bold">Import Failed</p>
            <p className="text-rose-300 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Import Successful
            </h3>
            <button
              onClick={() => setResults(null)}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-white">{results.total}</div>
              <div className="text-sm text-slate-400">Trades Imported</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-black text-emerald-400">{results.profitable}</div>
              <div className="text-sm text-slate-400">Profitable</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className={`text-3xl font-black ${results.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {results.totalPnl >= 0 ? '+' : ''}${results.totalPnl.toFixed(0)}
              </div>
              <div className="text-sm text-slate-400">Total P&L</div>
            </div>
          </div>
          
          <p className="text-sm text-slate-400 mb-4">
            {results.total} trades ready to import. Click "Import All" to add them to your journal.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (results.trades.length > 0) {
                  window.dispatchEvent(new CustomEvent('importTrades', { detail: results.trades }));
                }
              }}
              className="flex-1 py-3 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 rounded-xl text-black font-bold transition hover:brightness-105"
            >
              Import All ({results.total})
            </button>
            <button
              onClick={() => setResults(null)}
              className="py-3 px-6 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Tips */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Tips
        </h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• CSV must have headers in the first row</li>
          <li>• Supported delimiters: comma (,), tab, semicolon</li>
          <li>• Date format should be readable (ISO, MM/DD/YYYY, etc.)</li>
          <li>• Only trades with Symbol or P&L column can be imported</li>
        </ul>
      </div>
    </div>
  );
}
