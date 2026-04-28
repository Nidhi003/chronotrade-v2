import { supabase } from './supabase';
import localStorageManager from './storage';

const CLOUD_SYNC_KEY = 'chronotrade_cloud_enabled';

function toCloudTrade(trade, userId) {
  return {
    user_id: userId,
    symbol: trade.symbol,
    side: trade.side,
    entry_price: trade.entry_price ?? trade.entryPrice ?? null,
    exit_price: trade.exit_price ?? trade.exitPrice ?? null,
    quantity: trade.quantity ?? null,
    pnl: trade.pnl ?? 0,
    status: trade.status ?? ((trade.pnl ?? 0) >= 0 ? 'WIN' : 'LOSS'),
    strategy: trade.strategy,
    notes: trade.notes,
    risk_amount: trade.risk_amount ?? trade.riskAmount ?? null,
    swap_fee: trade.swap_fee ?? trade.swapFee ?? null,
    commission: trade.commission ?? null,
    timeframe: trade.timeframe ?? null,
    confidence: trade.confidence ?? null,
    synced: true,
    cloud_id: String(trade.cloud_id ?? trade.id),
    imported: !!trade.imported,
    created_at: trade.created_at ?? new Date().toISOString(),
  };
}

export const cloudSync = {
  isCloudEnabled: () => {
    return localStorage.getItem(CLOUD_SYNC_KEY) === 'true';
  },

  setCloudEnabled: (enabled) => {
    localStorage.setItem(CLOUD_SYNC_KEY, enabled.toString());
  },

  syncToCloud: async (userId) => {
    if (!userId) {
      throw new Error('User must be authenticated to sync');
    }

    const trades = localStorageManager.getTrades();
    const unsyncedTrades = trades.filter(t => !t.synced);

    if (unsyncedTrades.length === 0) {
      return { success: true, synced: 0, message: 'No trades to sync' };
    }

    try {
      for (const trade of unsyncedTrades) {
        const { data, error } = await supabase
          .from('trades')
          .upsert(toCloudTrade(trade, userId), { onConflict: 'cloud_id' })
          .select()
          .single();

        if (error) {
          console.error('Sync error for trade:', trade.id, error);
          throw error;
        }
      }

      localStorageManager.markAsSynced(unsyncedTrades.map(t => t.id));
      localStorageManager.updateSyncStatus({
        ...localStorageManager.getSyncStatus(),
        lastSync: new Date().toISOString()
      });

      return { success: true, synced: unsyncedTrades.length };
    } catch (error) {
      console.error('Cloud sync error:', error);
      throw error;
    }
  },

  fetchFromCloud: async (userId) => {
    if (!userId) {
      throw new Error('User must be authenticated to fetch');
    }

    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Fetch from cloud error:', error);
      throw error;
    }
  },

  mergeCloudData: async (userId) => {
    const cloudTrades = await cloudSync.fetchFromCloud(userId);
    const localTrades = localStorageManager.getTrades();
    
    const localIds = new Set(localTrades.map(t => t.id));
    const newTrades = cloudTrades.filter(t => !localIds.has(t.id));
    
    const merged = [
      ...newTrades.map(t => ({ ...t, synced: true })),
      ...localTrades
    ];
    
    localStorageManager.saveTrades(merged);
    return merged;
  }
};

export default cloudSync;
