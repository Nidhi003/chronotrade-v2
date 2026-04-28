"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudOff, RefreshCw, Check, X, Download, Upload, Trash2, AlertCircle, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import localStorageManager from "@/lib/storage";
import securityUtils from "@/lib/security";
import cloudSync from "@/lib/cloudSync";
import { useAuth } from "@/context/AuthContext";

export default function SyncSettings() {
  const { user, isAuthenticated } = useAuth();
  const [syncStatus, setSyncStatus] = useState({
    enabled: false,
    lastSync: null,
    pendingCount: 0,
    totalTrades: 0
  });
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [showSecurityOptions, setShowSecurityOptions] = useState(false);

  useEffect(() => {
    const trades = localStorageManager.getTrades();
    const unsynced = localStorageManager.getUnsyncedTrades();
    const status = localStorageManager.getSyncStatus();
    const cloudEnabled = cloudSync.isCloudEnabled();
    
    setSyncStatus({
      ...status,
      pendingCount: unsynced.length,
      totalTrades: trades.length,
      enabled: cloudEnabled && isAuthenticated
    });
  }, [isAuthenticated]);

  const handleSync = async () => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Please sign in to enable cloud sync' });
      return;
    }

    setSyncing(true);
    try {
      const result = await cloudSync.syncToCloud(user.id);
      setMessage({ type: 'success', text: `Synced ${result.synced} trades to cloud!` });
      
      const trades = localStorageManager.getTrades();
      const unsynced = localStorageManager.getUnsyncedTrades();
      setSyncStatus(prev => ({
        ...prev,
        pendingCount: unsynced.length,
        totalTrades: trades.length,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    try {
      const data = localStorageManager.exportTrades();
      if (!data) {
        setMessage({ type: 'error', text: 'No data to export' });
        return;
      }
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chronotrade-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Trades exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Export failed: ' + error.message });
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File too large. Maximum 10MB allowed.' });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (!content) {
          throw new Error('Empty file');
        }
        
        // Validate JSON structure before importing
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid format: expected array');
        }
        
        const imported = localStorageManager.importTrades(content);
        if (imported && imported.length > 0) {
          setMessage({ type: 'success', text: `Imported ${imported.length} trades!` });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setMessage({ type: 'error', text: 'Failed to import. Invalid file format.' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Import failed: Invalid JSON format' });
      }
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read file' });
    };
    reader.readAsText(file);
  };

  const handleDeleteAllData = () => {
    if (deleteCode !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' });
      return;
    }
    
    try {
      securityUtils.deleteUserData();
      setMessage({ type: 'success', text: 'All data deleted successfully!' });
      setShowDeleteConfirm(false);
      setDeleteCode('');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete data' });
    }
  };

  const handleExportAllData = () => {
    const data = securityUtils.exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronotrade-full-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Full data export downloaded!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleSync = async () => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Please sign in to enable cloud sync' });
      return;
    }

    const newStatus = !syncStatus.enabled;
    cloudSync.setCloudEnabled(newStatus);
    
    if (newStatus) {
      await handleSync();
    }
    
    setSyncStatus(prev => ({ ...prev, enabled: newStatus }));
    setMessage({ 
      type: newStatus ? 'success' : 'info', 
      text: newStatus ? 'Cloud sync enabled!' : 'Cloud sync disabled (local only)' 
    });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Cloud className="h-6 w-6 text-yellow-200" />
          Data & Sync
        </h2>
        <button
          onClick={() => setShowSecurityOptions(!showSecurityOptions)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-200/10 bg-slate-800 hover:bg-yellow-300/10 transition"
        >
          <Shield className="h-4 w-4 text-yellow-200" />
          <span className="text-sm text-slate-300">Security</span>
        </button>
      </div>

      {/* Security Options */}
      {showSecurityOptions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass rounded-xl p-5 border border-yellow-200/15"
        >
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-200" />
            Privacy & Security
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleExportAllData}
              className="w-full flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition"
            >
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-yellow-200" />
                <span className="text-white">Export All My Data (GDPR)</span>
              </div>
              <Download className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Your data is stored locally in your browser. We never transmit your trading data without your explicit consent.
          </p>
        </motion.div>
      )}

      {/* Sync Status Card */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              syncStatus.enabled ? 'bg-emerald-500/20' : 'bg-slate-800'
            }`}>
              {syncStatus.enabled ? (
                <Cloud className="h-6 w-6 text-emerald-400" />
              ) : (
                <CloudOff className="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {syncStatus.enabled ? 'Cloud Sync Active' : 'Local Storage Only'}
              </h3>
              <p className="text-sm text-slate-400">
                {syncStatus.enabled 
                  ? 'Your trades are synced to the cloud' 
                  : 'Data stored in your browser only'}
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleSync}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              syncStatus.enabled 
                ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {syncStatus.enabled ? 'Disable Sync' : 'Enable Sync'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-white">{syncStatus.totalTrades}</div>
            <div className="text-xs text-slate-400">Total Trades</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-amber-400">{syncStatus.pendingCount}</div>
            <div className="text-xs text-slate-400">Pending Sync</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-200">
              {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleDateString() : 'Never'}
            </div>
            <div className="text-xs text-slate-400">Last Sync</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${isAuthenticated ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isAuthenticated ? 'Connected' : 'Offline'}
            </div>
            <div className="text-xs text-slate-400">Cloud Status</div>
          </div>
        </div>

        {/* Manual Sync Button */}
        {syncStatus.enabled && isAuthenticated && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-6 py-3 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 disabled:opacity-50 rounded-xl text-black font-bold transition flex items-center gap-2 hover:brightness-105"
            >
              {syncing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' :
            message.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20' :
            'bg-yellow-300/10 border border-yellow-300/20'
          }`}
        >
          {message.type === 'success' && <Check className="h-5 w-5 text-emerald-400" />}
          {message.type === 'error' && <X className="h-5 w-5 text-rose-400" />}
          {message.type === 'info' && <RefreshCw className="h-5 w-5 text-yellow-200" />}
          <span className={
            message.type === 'success' ? 'text-emerald-400' :
            message.type === 'error' ? 'text-rose-400' : 'text-yellow-200'
          }>{message.text}</span>
        </motion.div>
      )}

      {/* Export/Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Download className="h-5 w-5 text-yellow-200" />
            Export Data
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Download all your trades as a JSON file for backup
          </p>
          <button
            onClick={handleExport}
            className="w-full py-3 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 rounded-xl text-black font-bold transition hover:brightness-105"
          >
            Export to JSON
          </button>
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Upload className="h-5 w-5 text-yellow-200" />
            Import Data
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Import trades from a previously exported JSON file
          </p>
          <label className="w-full py-3 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 rounded-xl text-black font-bold transition block text-center cursor-pointer hover:brightness-105">
            Import from JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-xl p-5 border border-rose-500/20">
        <h3 className="font-bold text-rose-400 mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Danger Zone
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Permanently delete all your trade data. This action cannot be undone.
        </p>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 rounded-xl text-rose-400 font-bold transition flex items-center justify-center gap-2"
          >
            <Trash2 className="h-5 w-5" />
            Delete All Data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-rose-400 font-medium">
              Type "DELETE" to confirm:
            </p>
            <input
              type="text"
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-3 bg-slate-800 border border-rose-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAllData}
                disabled={deleteCode !== 'DELETE'}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/30 disabled:text-rose-400/50 rounded-xl text-white font-bold transition flex items-center justify-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Confirm Delete
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteCode(''); }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
