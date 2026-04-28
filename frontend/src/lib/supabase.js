import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dysrodkzcflrkuepvife.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZXYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0ODM2NzIwMCwiZXhwIjoxOTYzOTEzMjAwfQ.ELqVNIJQJk3lD3EJ7fXwzkHYOEJBdNphjj6u4QPR3w';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ====== DATABASE FUNCTIONS ======

function normalizeTradePayload(trade) {
  return {
    symbol: trade.symbol,
    side: trade.side,
    entry_price: trade.entry_price ?? trade.entryPrice ?? null,
    exit_price: trade.exit_price ?? trade.exitPrice ?? null,
    quantity: trade.quantity ?? null,
    pnl: trade.pnl ?? 0,
    status: trade.status ?? ((trade.pnl ?? 0) >= 0 ? 'WIN' : 'LOSS'),
    strategy: trade.strategy ?? null,
    notes: trade.notes ?? null,
    risk_amount: trade.risk_amount ?? trade.riskAmount ?? null,
    swap_fee: trade.swap_fee ?? trade.swapFee ?? null,
    commission: trade.commission ?? null,
    timeframe: trade.timeframe ?? null,
    confidence: trade.confidence ?? null,
    synced: trade.synced ?? false,
    cloud_id: trade.cloud_id ?? null,
    imported: trade.imported ?? false,
    created_at: trade.created_at ?? new Date().toISOString(),
  };
}

function normalizeTradeUpdates(updates) {
  const payload = {};
  if ('symbol' in updates) payload.symbol = updates.symbol;
  if ('side' in updates) payload.side = updates.side;
  if ('entry_price' in updates || 'entryPrice' in updates) payload.entry_price = updates.entry_price ?? updates.entryPrice;
  if ('exit_price' in updates || 'exitPrice' in updates) payload.exit_price = updates.exit_price ?? updates.exitPrice;
  if ('quantity' in updates) payload.quantity = updates.quantity;
  if ('pnl' in updates) payload.pnl = updates.pnl;
  if ('status' in updates) payload.status = updates.status;
  if ('strategy' in updates) payload.strategy = updates.strategy;
  if ('notes' in updates) payload.notes = updates.notes;
  if ('risk_amount' in updates || 'riskAmount' in updates) payload.risk_amount = updates.risk_amount ?? updates.riskAmount;
  if ('swap_fee' in updates || 'swapFee' in updates) payload.swap_fee = updates.swap_fee ?? updates.swapFee;
  if ('commission' in updates) payload.commission = updates.commission;
  if ('timeframe' in updates) payload.timeframe = updates.timeframe;
  if ('confidence' in updates) payload.confidence = updates.confidence;
  if ('synced' in updates) payload.synced = updates.synced;
  if ('cloud_id' in updates) payload.cloud_id = updates.cloud_id;
  if ('imported' in updates) payload.imported = updates.imported;
  if ('created_at' in updates) payload.created_at = updates.created_at;
  return payload;
}

// Trades
export async function fetchTrades() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function addTrade(trade) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('trades')
    .insert([{ 
      ...normalizeTradePayload(trade), 
      user_id: user.id 
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTrade(id, updates) {
  const { data, error } = await supabase
    .from('trades')
    .update(normalizeTradeUpdates(updates))
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteTrade(id) {
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Journal
export async function fetchJournal() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function addJournalEntry(entry) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([{ 
      ...entry, 
      user_id: user.id 
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateJournalEntry(id, updates) {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteJournalEntry(id) {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
