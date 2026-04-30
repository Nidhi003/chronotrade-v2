// Local Storage Manager with Security
import securityUtils from './security';

const STORAGE_KEY = 'chronotrade_trades';
const SYNC_STATUS_KEY = 'chronotrade_sync_status';
const TRADE_LIMIT_KEY = 'chronotrade_trade_limits';

const FREE_TRADE_LIMIT = 10;
const FREE_TRADE_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days

export const localStorageManager = {
  getTrades: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading trades:', e);
      return [];
    }
  },

  // Save trades to local storage
  saveTrades: (trades) => {
    try {
      // Validate data before saving
      if (!Array.isArray(trades)) {
        console.error('Invalid trades data');
        return false;
      }
      
      // Limit to last 1000 trades for performance
      const trimmedTrades = trades.slice(0, 1000);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedTrades));
      return true;
    } catch (e) {
      console.error('Error saving trades:', e);
      return false;
    }
  },

  // Add a single trade with sanitization
  addTrade: (trade) => {
    const trades = localStorageManager.getTrades();
    
    // Sanitize trade data for security
    const sanitizedTrade = securityUtils.sanitizeTradeData(trade);
    
    const newTrade = {
      ...sanitizedTrade,
      riskAmount: parseFloat(trade.riskAmount) || 0,
      swapFee: parseFloat(trade.swapFee) || 0,
      commission: parseFloat(trade.commission) || 0,
      timeframe: securityUtils.sanitizeInput(trade.timeframe || ''),
      confidence: securityUtils.sanitizeInput(trade.confidence || ''),
      imported: !!trade.imported,
      id: securityUtils.generateSecureId(),
      created_at: trade.created_at || new Date().toISOString(),
      synced: false
    };
    
    // Validate P&L is within reasonable bounds
    if (Math.abs(newTrade.pnl) > 10000000) {
      console.error('Suspicious P&L value detected');
      newTrade.pnl = Math.max(-10000000, Math.min(10000000, newTrade.pnl));
    }
    
    trades.unshift(newTrade);
    localStorageManager.saveTrades(trades);
    return newTrade;
  },

  // Update a trade in local storage
  updateTrade: (id, updates) => {
    const trades = localStorageManager.getTrades();
    const index = trades.findIndex(t => t.id == id);
    if (index === -1) return null;
    
    const updated = { ...trades[index], ...updates };
    trades[index] = updated;
    localStorageManager.saveTrades(trades);
    return updated;
  },

  // Delete a trade with validation
  deleteTrade: (id) => {
    const trades = localStorageManager.getTrades();
    
    // Validate ID
    if (!id || typeof id !== 'string' && typeof id !== 'number') {
      return trades;
    }
    
    const filtered = trades.filter(t => t.id != id);
    localStorageManager.saveTrades(filtered);
    return filtered;
  },

  // Export trades to JSON
  exportTrades: () => {
    const trades = localStorageManager.getTrades();
    return JSON.stringify(trades, null, 2);
  },

  // Import trades from JSON
  importTrades: (jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      const existing = localStorageManager.getTrades();
      const merged = [...imported, ...existing].map(t => ({ ...t, synced: false }));
      localStorageManager.saveTrades(merged);
      return merged;
    } catch (e) {
      console.error('Import error:', e);
      return null;
    }
  },

  // Get sync status
  getSyncStatus: () => {
    try {
      return JSON.parse(localStorage.getItem(SYNC_STATUS_KEY)) || {
        enabled: false,
        lastSync: null,
        pendingCount: 0
      };
    } catch (e) {
      return { enabled: false, lastSync: null, pendingCount: 0 };
    }
  },

  // Update sync status
  updateSyncStatus: (status) => {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
  },

  // Get unsynced trades
  getUnsyncedTrades: () => {
    const trades = localStorageManager.getTrades();
    return trades.filter(t => !t.synced);
  },

  // Mark trades as synced
  markAsSynced: (ids) => {
    const trades = localStorageManager.getTrades();
    const updated = trades.map(t => 
      ids.includes(t.id) ? { ...t, synced: true } : t
    );
    localStorageManager.saveTrades(updated);
    return updated;
  },

  // Clear all data
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SYNC_STATUS_KEY);
  },

  // Check trade limit for free users
  checkTradeLimit: () => {
    const tier = localStorage.getItem('chronotrade_tier') || 'free';
    if (tier !== 'free') return { allowed: true, remaining: -1 };
    
    const limits = JSON.parse(localStorage.getItem(TRADE_LIMIT_KEY)) || {
      periodStart: Date.now(),
      tradesCount: 0
    };
    
    const now = Date.now();
    const periodEnd = limits.periodStart + FREE_TRADE_PERIOD;
    
    if (now > periodEnd) {
      const newLimits = {
        periodStart: now,
        tradesCount: 0
      };
      localStorage.setItem(TRADE_LIMIT_KEY, JSON.stringify(newLimits));
      return { allowed: true, remaining: FREE_TRADE_LIMIT, periodStart: now };
    }
    
    const remaining = FREE_TRADE_LIMIT - limits.tradesCount;
    return { 
      allowed: remaining > 0, 
      remaining: Math.max(0, remaining),
      tradesCount: limits.tradesCount,
      periodStart: limits.periodStart,
      periodEnd: periodEnd
    };
  },

  // Increment trade count for free users
  incrementTradeCount: () => {
    const tier = localStorage.getItem('chronotrade_tier') || 'free';
    if (tier !== 'free') return;
    
    const limits = JSON.parse(localStorage.getItem(TRADE_LIMIT_KEY)) || {
      periodStart: Date.now(),
      tradesCount: 0
    };
    
    const now = Date.now();
    const periodEnd = limits.periodStart + FREE_TRADE_PERIOD;
    
    if (now > periodEnd) {
      const newLimits = {
        periodStart: now,
        tradesCount: 1
      };
      localStorage.setItem(TRADE_LIMIT_KEY, JSON.stringify(newLimits));
    } else {
      const newLimits = {
        ...limits,
        tradesCount: limits.tradesCount + 1
      };
      localStorage.setItem(TRADE_LIMIT_KEY, JSON.stringify(newLimits));
    }
  },

  // Get limit info
  getLimitInfo: () => {
    return localStorageManager.checkTradeLimit();
  }
};

export default localStorageManager;
