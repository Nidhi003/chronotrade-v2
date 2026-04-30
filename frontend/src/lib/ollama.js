const OLLAMA_URL = 'http://localhost:11434';

export async function askOllama(prompt, systemPrompt = null) {
  const messages = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3:8b',
      messages,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.message.content;
}

export async function getAIInsights(tradeHistory) {
  const systemPrompt = `You are an expert trading analyst AI. Analyze the user's trade history and provide behavioral insights.
  
  Focus on:
  1. Detected trading patterns (revenge trading, early exit, over-trading)
  2. Strategy performance analysis
  3. Risk management observations
  4. Actionable coaching recommendations
  
  Respond in JSON format:
  {
    "leaks": [{ "title", "description", "severity", "impact" }],
    "strengths": [{ "title", "description" }],
    "radar": { "discipline", "riskMgmt", "execution", "patience", "emotional" },
    "actions": [{ "title", "desc", "action" }]
  }`;

  const prompt = `Analyze these trades: ${JSON.stringify(tradeHistory)}. Provide JSON only.`;

  try {
    const result = await askOllama(prompt, systemPrompt);
    return JSON.parse(result);
  } catch (error) {
    console.error('AI insights error:', error.message);
    throw new Error('AI service unavailable. Make sure Ollama is running locally.');
  }
}

export async function getTradingAnalysis(trades) {
  const systemPrompt = `You are a trading coach AI. Analyze the user's recent trades and provide concise, actionable insights.
Keep responses brief (2-3 sentences max). Focus on patterns, risk, and improvements.`;

  const prompt = `My recent trades: ${trades.map(t => `${t.symbol} ${t.side} ${t.pnl > 0 ? 'WIN' : 'LOSS'}`).join(', ')}. What's my edge and weakness?`;

  try {
    return await askOllama(prompt, systemPrompt);
  } catch (error) {
    console.error('Trading analysis error:', error.message);
    throw new Error('AI analysis unavailable. Make sure Ollama is running locally.');
  }
}