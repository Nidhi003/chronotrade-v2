import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function fetchTrades() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/trades`, { headers });
  if (!res.ok) throw new Error('Failed to fetch trades');
  return res.json();
}

export async function addTrade(trade) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/trades`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(trade),
  });
  if (!res.ok) throw new Error('Failed to add trade');
  return res.json();
}

export async function deleteTrade(id) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/trades/${id}`, { method: 'DELETE', headers });
  if (!res.ok) throw new Error('Failed to delete trade');
}

export async function fetchJournal() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/journal`, { headers });
  if (!res.ok) throw new Error('Failed to fetch journal');
  return res.json();
}

export async function addJournalEntry(entry) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/journal`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to add entry');
  return res.json();
}

export async function getSubscription(subscriptionId) {
  const res = await fetch(`${API_URL}/subscriptions/${subscriptionId}`);
  if (!res.ok) throw new Error('Failed to fetch subscription');
  return res.json();
}

export async function createSubscription(priceId, customerId) {
  const res = await fetch(`${API_URL}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, customerId }),
  });
  if (!res.ok) throw new Error('Failed to create subscription');
  return res.json();
}

export async function cancelSubscription(subscriptionId) {
  const res = await fetch(`${API_URL}/subscriptions/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscriptionId }),
  });
  if (!res.ok) throw new Error('Failed to cancel subscription');
  return res.json();
}