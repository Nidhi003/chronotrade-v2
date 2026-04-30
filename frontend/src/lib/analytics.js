import { askOllama } from './ollama';

export async function analyzeTradePatterns(trades) {
  const systemPrompt = `You are an expert trading psychologist. Analyze the trade history and identify:
1. Revenge trading patterns (trading larger after losses)
2. FOMO entries (late entries after missing moves)
3. Over-trading (too many trades in a day)
4. Early exit patterns
5. Time-of-day patterns
6. Day-of-week patterns

Respond in JSON:
{
  "patterns": [{"type", "description", "severity": "high|medium|low", "evidence"}],
  "recommendations": [{"action", "reason"}]
}`;

  const prompt = `Analyze these trades: ${JSON.stringify(trades)}`;
  
  try {
    const result = await askOllama(prompt, systemPrompt);
    return JSON.parse(result);
  } catch (e) {
    console.error('Pattern analysis error:', e);
    throw new Error('Failed to analyze trade patterns');
  }
}

export function calculateMetrics(trades) {
  if (!trades?.length) return null;

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winRate = (wins.length / trades.length) * 100;
  
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 1;
  const profitFactor = avgLoss ? avgWin / avgLoss : 0;
  
  const expectancy = (winRate / 100) * avgWin - (1 - winRate / 100) * avgLoss;

  const byStrategy = {};
  trades.forEach(t => {
    const strat = t.strategy || 'Unknown';
    if (!byStrategy[strat]) byStrategy[strat] = { wins: 0, losses: 0, pnl: 0 };
    if (t.pnl > 0) byStrategy[strat].wins++;
    else byStrategy[strat].losses++;
    byStrategy[strat].pnl += t.pnl || 0;
  });

  const bySession = {};
  trades.forEach(t => {
    const session = t.session || 'Unknown';
    if (!bySession[session]) bySession[session] = { wins: 0, losses: 0, pnl: 0 };
    if (t.pnl > 0) bySession[session].wins++;
    else bySession[session].losses++;
    bySession[session].pnl += t.pnl || 0;
  });

  const byDay = {};
  trades.forEach(t => {
    const day = new Date(t.created_at).toLocaleDateString('en-US', { weekday: 'short' });
    if (!byDay[day]) byDay[day] = { wins: 0, losses: 0, pnl: 0 };
    if (t.pnl > 0) byDay[day].wins++;
    else byDay[day].losses++;
    byDay[day].pnl += t.pnl || 0;
  });

  const byTime = {};
  trades.forEach(t => {
    const hour = new Date(t.created_at).getHours();
    const timeBlock = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
    if (!byTime[timeBlock]) byTime[timeBlock] = { wins: 0, losses: 0, pnl: 0 };
    if (t.pnl > 0) byTime[timeBlock].wins++;
    else byTime[timeBlock].losses++;
    byTime[timeBlock].pnl += t.pnl || 0;
  });

  return {
    total: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: winRate.toFixed(1),
    totalPnl,
    avgWin: avgWin.toFixed(2),
    avgLoss: avgLoss.toFixed(2),
    profitFactor: profitFactor.toFixed(2),
    expectancy: expectancy.toFixed(2),
    largestWin: Math.max(...trades.map(t => t.pnl || 0)),
    largestLoss: Math.min(...trades.map(t => t.pnl || 0)),
    byStrategy: Object.entries(byStrategy).map(([name, data]) => ({
      name,
      ...data,
      winRate: ((data.wins / (data.wins + data.losses)) * 100).toFixed(1)
    })),
    bySession: Object.entries(bySession).map(([name, data]) => ({
      name,
      ...data,
      winRate: ((data.wins / (data.wins + data.losses)) * 100).toFixed(1)
    })),
    byDay: Object.entries(byDay).map(([name, data]) => ({
      name,
      ...data,
      winRate: ((data.wins / (data.wins + data.losses)) * 100).toFixed(1)
    })),
    byTime: Object.entries(byTime).map(([name, data]) => ({
      name,
      ...data,
      winRate: ((data.wins / (data.wins + data.losses)) * 100).toFixed(1)
    }))
  };
}

export function calculatePositionSize(accountSize, riskPercent, stopLossPips, pipValue) {
  const riskAmount = accountSize * (riskPercent / 100);
  const positionSize = riskAmount / (stopLossPips * pipValue);
  return {
    riskAmount,
    positionSize: positionSize.toFixed(2),
    potentialReward: (positionSize * stopLossPips * 2 * pipValue).toFixed(2)
  };
}