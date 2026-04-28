"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, Plus, Settings, RefreshCw, Pencil, Trash2, X, Check } from "lucide-react";

const MOCK_ACCOUNTS = [
  { id: 1, name: 'FundedAccount1', broker: 'NextStep', balance: 12500, equity: 13200, pnl: 700, drawdown: 2.1, status: 'active' },
  { id: 2, name: 'ChallengeAccount', broker: 'Apax', balance: 5000, equity: 5200, pnl: 200, drawdown: 1.8, status: 'active' },
  { id: 3, name: 'DemoAccount', broker: 'Demo', balance: 10000, equity: 9800, pnl: -200, drawdown: 3.2, status: 'paused' },
];

export default function MultiAccountDashboard({ trades = [], accountBalance = 10000 }) {
  const [customAccounts, setCustomAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chronotrade_accounts')) || [];
    } catch {
      return [];
    }
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const liveAccount = useMemo(() => {
    const pnl = trades.reduce((sum, trade) => sum + (parseFloat(trade.pnl) || 0), 0);
    let peak = accountBalance;
    let running = accountBalance;
    let maxDrawdown = 0;

    [...trades].reverse().forEach((trade) => {
      running += parseFloat(trade.pnl) || 0;
      peak = Math.max(peak, running);
      maxDrawdown = Math.max(maxDrawdown, peak > 0 ? ((peak - running) / peak) * 100 : 0);
    });

    return {
      id: 'live',
      name: 'ChronoTradez Live Journal',
      broker: 'Local + Cloud',
      balance: accountBalance,
      equity: accountBalance + pnl,
      pnl,
      drawdown: maxDrawdown,
      status: trades.length ? 'active' : 'ready',
    };
  }, [trades, accountBalance]);

  const accounts = [liveAccount, ...customAccounts];
  
  const totalEquity = accounts.reduce((s, a) => s + a.equity, 0);
  const totalPnl = accounts.reduce((s, a) => s + a.pnl, 0);
  const avgDrawdown = accounts.reduce((s, a) => s + a.drawdown, 0) / Math.max(accounts.length, 1);

  const addAccount = () => {
    const name = window.prompt('Account name');
    if (!name?.trim()) return;
    const balance = parseFloat(window.prompt('Starting balance', '10000') || '10000') || 10000;
    const newAccount = {
      id: Date.now(),
      name: name.trim(),
      broker: 'Manual',
      balance,
      equity: balance,
      pnl: 0,
      drawdown: 0,
      status: 'tracking',
    };
    const next = [newAccount, ...customAccounts];
    setCustomAccounts(next);
    localStorage.setItem('chronotrade_accounts', JSON.stringify(next));
  };

  const startEdit = (account) => {
    if (account.id === 'live') return;
    setEditingId(account.id);
    setEditForm({ ...account });
  };

  const saveEdit = () => {
    const next = customAccounts.map(a => a.id === editingId ? { ...editForm, equity: editForm.balance + editForm.pnl } : a);
    setCustomAccounts(next);
    localStorage.setItem('chronotrade_accounts', JSON.stringify(next));
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const deleteAccount = (id) => {
    if (!window.confirm('Delete this account?')) return;
    const next = customAccounts.filter(a => a.id !== id);
    setCustomAccounts(next);
    localStorage.setItem('chronotrade_accounts', JSON.stringify(next));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-yellow-200" />
            Multi-Account Dashboard
          </h2>
          <p className="text-slate-400">Track all your prop firm accounts</p>
        </div>
        <button onClick={addAccount} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 text-black rounded-xl font-bold hover:brightness-105">
          <Plus className="h-4 w-4" /> Add Account
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Accounts</div>
          <div className="text-2xl font-black text-white">{accounts.length}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-slate-400">Combined Equity</div>
          <div className="text-2xl font-black text-white">${totalEquity.toLocaleString()}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-slate-400">Today's P&L</div>
          <div className={`text-2xl font-black ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl}
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-slate-400">Avg Drawdown</div>
          <div className="text-2xl font-black text-yellow-400">{avgDrawdown.toFixed(1)}%</div>
        </div>
      </div>
      
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="text-left p-4 text-xs text-slate-400 font-medium">Account</th>
              <th className="text-left p-4 text-xs text-slate-400 font-medium">Broker</th>
              <th className="text-right p-4 text-xs text-slate-400 font-medium">Balance</th>
              <th className="text-right p-4 text-xs text-slate-400 font-medium">Equity</th>
              <th className="text-right p-4 text-xs text-slate-400 font-medium">P&L</th>
              <th className="text-right p-4 text-xs text-slate-400 font-medium">Drawdown</th>
              <th className="text-center p-4 text-xs text-slate-400 font-medium">Status</th>
              <th className="text-center p-4 text-xs text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(account => (
              <motion.tr 
                key={account.id}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                className="border-t border-white/5"
              >
                {editingId === account.id ? (
                  <>
                    <td className="p-2"><input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-800 text-white px-2 py-1 rounded" /></td>
                    <td className="p-2"><input value={editForm.broker} onChange={e => setEditForm({...editForm, broker: e.target.value})} className="w-full bg-slate-800 text-white px-2 py-1 rounded" /></td>
                    <td className="p-2"><input type="number" value={editForm.balance} onChange={e => setEditForm({...editForm, balance: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 text-white px-2 py-1 rounded text-right" /></td>
                    <td className="p-2 text-right text-white">${account.equity.toLocaleString()}</td>
                    <td className="p-2"><input type="number" value={editForm.pnl} onChange={e => setEditForm({...editForm, pnl: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 text-white px-2 py-1 rounded text-right" /></td>
                    <td className="p-2"><input type="number" value={editForm.drawdown} onChange={e => setEditForm({...editForm, drawdown: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 text-white px-2 py-1 rounded text-right" /></td>
                    <td className="p-2">
                      <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="bg-slate-800 text-white px-2 py-1 rounded">
                        <option value="active">active</option>
                        <option value="paused">paused</option>
                        <option value="tracking">tracking</option>
                      </select>
                    </td>
                    <td className="p-2 flex gap-1 justify-center">
                      <button onClick={saveEdit} className="p-1 bg-emerald-600 rounded text-white"><Check className="h-4 w-4" /></button>
                      <button onClick={cancelEdit} className="p-1 bg-slate-600 rounded text-white"><X className="h-4 w-4" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 font-medium text-white">{account.name}</td>
                    <td className="p-4 text-slate-400">{account.broker}</td>
                    <td className="p-4 text-right text-white">${account.balance.toLocaleString()}</td>
                    <td className="p-4 text-right text-white">${account.equity.toLocaleString()}</td>
                    <td className={`p-4 text-right ${account.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {account.pnl >= 0 ? '+' : ''}${account.pnl}
                    </td>
                    <td className="p-4 text-right text-yellow-400">{account.drawdown}%</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        account.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {account.id !== 'live' && (
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => startEdit(account)} className="p-1 hover:bg-slate-700 rounded"><Pencil className="h-4 w-4 text-slate-400" /></button>
                          <button onClick={() => deleteAccount(account.id)} className="p-1 hover:bg-rose-500/20 rounded"><Trash2 className="h-4 w-4 text-rose-400" /></button>
                        </div>
                      )}
                    </td>
                  </>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
