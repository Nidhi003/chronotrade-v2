import { supabase } from './supabase';

const sanitizeInput = (v) => String(v || '').slice(0, 100);
const sanitizeHtml = (v) => String(v || '').slice(0, 5000);
const generateSecureId = () => crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

const STORAGE_KEY = 'chronotrade_trades';
const SYNC_STATUS_KEY = 'chronotrade_sync_status';
const TRADE_LIMIT_KEY = 'chronotrade_trade_limits';
const JOURNAL_KEY = 'chronotrade_journal';
const MOOD_KEY = 'chronotrade_mood';
const ACCOUNTS_KEY = 'chronotrade_accounts';
const SETTINGS_KEY = 'chronotrade_settings';

const FREE_TRADE_LIMIT = 10;
const FREE_TRADE_PERIOD = 30 * 24 * 60 * 60 * 1000;

export async function loadTradesWithFallback() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const cloudTrades = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!cloudTrades.error && cloudTrades.data?.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudTrades.data));
        return cloudTrades.data;
      }
    }
  } catch (e) {
    console.warn('Cloud load failed, using local storage');
  }
  const localTrades = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return localTrades;
}

export async function loadJournalWithFallback() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const cloudJournal = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!cloudJournal.error && cloudJournal.data?.length) {
        localStorage.setItem(JOURNAL_KEY, JSON.stringify(cloudJournal.data));
        return cloudJournal.data;
      }
    }
  } catch (e) {
    console.warn('Cloud journal load failed, using local');
  }
  return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
}

export async function saveJournalToCloud(entry) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{ ...entry, user_id: user.id }])
      .select()
      .single();
    
    if (!error && data) {
      const existing = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
      localStorage.setItem(JOURNAL_KEY, JSON.stringify([data, ...existing]));
      return data;
    }
  } catch (e) {
    console.error('Cloud journal save failed:', e);
  }
  const localEntry = { ...entry, id: entry.id || crypto.randomUUID(), created_at: new Date().toISOString() };
  const existing = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
  localStorage.setItem(JOURNAL_KEY, JSON.stringify([localEntry, ...existing]));
  return localEntry;
}

export async function deleteJournalFromCloud(id) {
  try {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (!error) {
      const existing = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(existing.filter(e => e.id !== id)));
    }
  } catch (e) {
    console.warn('Cloud journal delete failed, local only');
    const existing = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(existing.filter(e => e.id !== id)));
  }
}

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
    
    const newTrade = {
      symbol: sanitizeInput(trade.symbol || '').toUpperCase().slice(0, 20),
      side: ['LONG', 'SHORT'].includes(trade.side) ? trade.side : 'LONG',
      quantity: Math.max(0, parseFloat(trade.quantity) || 0),
      entryPrice: Math.max(0, parseFloat(trade.entryPrice) || 0),
      exitPrice: Math.max(0, parseFloat(trade.exitPrice) || 0),
      pnl: parseFloat(trade.pnl) || 0,
      riskAmount: parseFloat(trade.riskAmount) || 0,
      swapFee: parseFloat(trade.swapFee) || 0,
      commission: parseFloat(trade.commission) || 0,
      strategy: sanitizeInput(trade.strategy || 'Other').slice(0, 50),
      timeframe: sanitizeInput(trade.timeframe || '').slice(0, 20),
      confidence: sanitizeInput(trade.confidence || 'medium').slice(0, 20),
      notes: sanitizeHtml(trade.notes || '').slice(0, 5000),
      status: parseFloat(trade.pnl) >= 0 ? 'WIN' : 'LOSS',
      imported: !!trade.imported,
      id: generateSecureId(),
      created_at: trade.created_at || new Date().toISOString(),
      synced: false
    };
    
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
