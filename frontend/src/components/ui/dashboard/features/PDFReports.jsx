"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, TrendingUp, DollarSign, Target, Loader2, CheckCircle } from "lucide-react";
import { jsPDF } from "jspdf";

export default function PDFReports({ trades = [], userName = "Trader" }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  
  const calculateStats = () => {
    const wins = trades.filter(t => (t.pnl || 0) > 0);
    const losses = trades.filter(t => (t.pnl || 0) <= 0);
    const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
    const winRate = trades.length ? (wins.length / trades.length * 100).toFixed(1) : 0;
    const avgWin = wins.length ? (wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length) : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0) / losses.length) : 1;
    const profitFactor = avgLoss ? (avgWin / avgLoss).toFixed(2) : '0.00';
    
    // Calculate by strategy
    const strategyStats = {};
    trades.forEach(t => {
      const strat = t.strategy || 'Other';
      if (!strategyStats[strat]) strategyStats[strat] = { wins: 0, losses: 0, pnl: 0 };
      if ((t.pnl || 0) > 0) strategyStats[strat].wins++;
      else strategyStats[strat].losses++;
      strategyStats[strat].pnl += (t.pnl || 0);
    });
    
    return { 
      totalPnl: totalPnl.toFixed(2), 
      winRate, 
      avgWin: avgWin.toFixed(2), 
      avgLoss: avgLoss.toFixed(2),
      profitFactor,
      totalTrades: trades.length,
      wins: wins.length,
      losses: losses.length,
      strategies: Object.entries(strategyStats).map(([name, data]) => ({
        name,
        ...data,
        winRate: ((data.wins / (data.wins + data.losses)) * 100).toFixed(1)
      }))
    };
  };
  
  const generatePDF = () => {
    setGenerating(true);
    setGenerated(false);
    
    try {
      const stats = calculateStats();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(30, 41, 59);
      doc.text('ChronoTradez', pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      doc.setFontSize(18);
      doc.text('Performance Report', pageWidth / 2, y, { align: 'center' });
      y += 15;
      
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(`${userName} | ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report`, pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
      y += 20;
      
      // Summary Stats
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, pageWidth - 30, 40, 'F');
      y += 10;
      
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Summary', 20, y);
      y += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      
      const statsData = [
        ['Net P&L', `$${stats.totalPnl}`, 'Win Rate', `${stats.winRate}%`],
        ['Total Trades', stats.totalTrades.toString(), 'W/L Ratio', `${stats.wins}/${stats.losses}`],
        ['Avg Win', `$${stats.avgWin}`, 'Avg Loss', `$${stats.avgLoss}`],
        ['Profit Factor', stats.profitFactor, 'Status', parseFloat(stats.totalPnl) >= 0 ? 'PROFITABLE' : 'LOSS']
      ];
      
      statsData.forEach(([label1, val1, label2, val2]) => {
        doc.text(label1, 25, y);
        doc.setTextColor(30, 41, 59);
        doc.text(val1, 70, y);
        doc.setTextColor(71, 85, 105);
        doc.text(label2, 110, y);
        doc.setTextColor(30, 41, 59);
        doc.text(val2, 150, y);
        doc.setTextColor(71, 85, 105);
        y += 7;
      });
      
      y += 15;
      
      // Strategy Performance
      if (stats.strategies.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('Performance by Strategy', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('Strategy', 20, y);
        doc.text('Wins', 80, y);
        doc.text('Losses', 110, y);
        doc.text('Win Rate', 140, y);
        doc.text('P&L', 170, y);
        y += 5;
        
        doc.line(20, y, 190, y);
        y += 5;
        
        doc.setTextColor(30, 41, 59);
        stats.strategies.forEach(strat => {
          doc.text(strat.name, 20, y);
          doc.text(strat.wins.toString(), 80, y);
          doc.text(strat.losses.toString(), 110, y);
          doc.text(`${strat.winRate}%`, 140, y);
          doc.setTextColor(strat.pnl >= 0 ? 16 : 220, 185, str => str.setColor(strat.pnl >= 0 ? 101 : 99));
          doc.text(`$${strat.pnl.toFixed(2)}`, 170, y);
          doc.setTextColor(30, 41, 59);
          y += 6;
          
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });
        
        y += 10;
      }
      
      // Recent Trades
      y += 5;
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text('Recent Trades', 20, y);
      y += 10;
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Symbol', 20, y);
      doc.text('Side', 60, y);
      doc.text('Strategy', 85, y);
      doc.text('P&L', 150, y);
      doc.text('Date', 175, y);
      y += 4;
      
      doc.line(20, y, 190, y);
      y += 4;
      
      doc.setTextColor(30, 41, 59);
      trades.slice(0, 15).forEach(trade => {
        doc.text(trade.symbol || '-', 20, y);
        doc.text(trade.side || '-', 60, y);
        doc.text((trade.strategy || 'Other').substring(0, 12), 85, y);
        doc.setTextColor((trade.pnl || 0) >= 0 ? 16 : 220, 185, (trade.pnl || 0) >= 0 ? 101 : 99);
        doc.text(`$${(trade.pnl || 0).toFixed(2)}`, 150, y);
        doc.setTextColor(100, 116, 139);
        doc.text(new Date(trade.created_at).toLocaleDateString(), 175, y);
        doc.setTextColor(30, 41, 59);
        y += 5;
        
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
      
      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Generated by ChronoTradez Trading Journal', pageWidth / 2, footerY, { align: 'center' });
      
      // Save
      doc.save(`chronotrade-${selectedPeriod}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setGenerating(false);
    }
  };
  
  const stats = calculateStats();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            Performance Reports
          </h2>
          <p className="text-slate-400">Export professional PDF summaries</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1 rounded-lg text-sm ${
                selectedPeriod === p ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <DollarSign className="h-5 w-5 text-emerald-500 mb-2" />
          <div className="text-xs text-slate-400">Net P&L</div>
          <div className="text-xl font-black text-white">${stats.totalPnl}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <Target className="h-5 w-5 text-blue-500 mb-2" />
          <div className="text-xs text-slate-400">Win Rate</div>
          <div className="text-xl font-black text-white">{stats.winRate}%</div>
        </div>
        <div className="glass rounded-xl p-4">
          <TrendingUp className="h-5 w-5 text-emerald-500 mb-2" />
          <div className="text-xs text-slate-400">Profit Factor</div>
          <div className="text-xl font-black text-white">{stats.profitFactor}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <Calendar className="h-5 w-5 text-slate-500 mb-2" />
          <div className="text-xs text-slate-400">Total Trades</div>
          <div className="text-xl font-black text-white">{stats.totalTrades}</div>
        </div>
      </div>
      
      <div className="glass rounded-xl p-6">
        <h3 className="font-bold text-white mb-4">Report Preview</h3>
        
        <div className="bg-white text-black p-6 rounded-lg max-h-80 overflow-y-auto">
          <div className="border-b pb-3 mb-3">
            <h1 className="text-xl font-bold">Performance Report</h1>
            <p className="text-sm text-gray-600">{userName} • {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} 2024</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">Net P&L</div>
              <div className="text-lg font-bold">${stats.totalPnl}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Win Rate</div>
              <div className="text-lg font-bold">{stats.winRate}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Profit Factor</div>
              <div className="text-lg font-bold">{stats.profitFactor}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Trades</div>
              <div className="text-lg font-bold">{stats.totalTrades}</div>
            </div>
          </div>
          
          {stats.strategies.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <div className="text-sm font-bold mb-2">Top Strategies</div>
              {stats.strategies.slice(0, 3).map((s, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{s.name}</span>
                  <span className={s.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>${s.pnl.toFixed(2)} ({s.winRate}%)</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4 pt-2 border-t">
            Generated by ChronoTradez • {new Date().toLocaleDateString()}
          </div>
        </div>
        
        <button
          onClick={generatePDF}
          disabled={generating || trades.length === 0}
          className="w-full mt-4 py-3 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : generated ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF Report
            </>
          )}
        </button>
        
        {trades.length === 0 && (
          <p className="text-center text-sm text-slate-500 mt-2">Add trades to generate reports</p>
        )}
      </div>
    </div>
  );
}