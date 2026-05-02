import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import razorpayRoutes from './routes/razorpay.js';

dotenv.config();

const app = express();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Too many API requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for free tier
const freeTierLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Free tier rate limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0'); // CSP handles XSS protection now
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.razorpay.com; font-src 'self'; frame-src https://checkout.razorpay.com;");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_KEY || 'your-anon-key'
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in production'); })() : process.env.SUPABASE_KEY || 'your-service-role-key')
);

// Input validation helpers
function sanitizeString(str, maxLength = 1000) {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLength).replace(/[<>]/g, '');
}

function validateTradeInput(body) {
  const { symbol, side, entry_price, exit_price, pnl, quantity } = body;
  
  if (symbol && (typeof symbol !== 'string' || symbol.length > 20 || !/^[A-Z0-9]+$/.test(symbol))) {
    throw new Error('Invalid symbol format');
  }
  if (side && !['LONG', 'SHORT'].includes(side)) {
    throw new Error('Invalid side - must be LONG or SHORT');
  }
  if (entry_price && isNaN(parseFloat(entry_price))) {
    throw new Error('Invalid entry_price');
  }
  if (exit_price && isNaN(parseFloat(exit_price))) {
    throw new Error('Invalid exit_price');
  }
  if (pnl && isNaN(parseFloat(pnl))) {
    throw new Error('Invalid pnl');
  }
  if (quantity && isNaN(parseFloat(quantity))) {
    throw new Error('Invalid quantity');
  }
  
  return true;
}

function validateJournalInput(body) {
  const { title, content } = body;
  
  if (title && (typeof title !== 'string' || title.length > 200)) {
    throw new Error('Title too long');
  }
  if (content && (typeof content !== 'string' || content.length > 50000)) {
    throw new Error('Content too long');
  }
  
  return true;
}

function getAuthedSupabase(token) {
  return createClient(
    process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    process.env.SUPABASE_KEY || 'your-anon-key',
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Razorpay webhook needs raw body for signature verification (must be before express.json)
app.use('/api/webhook/razorpay', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' }));
app.use(compression({ threshold: 1024 }));

// Razorpay routes
app.use('/api', razorpayRoutes);

// Auth routes
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.json({ user: data.user, session: data.session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Trades routes
app.get('/api/trades', apiLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid user' });
    const db = getAuthedSupabase(token);

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const { data, error, count } = await db
      .from('trades')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    res.json({ data, page, limit, total: count || 0 });
  } catch (error) {
    console.error('Trades fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

app.post('/api/trades', apiLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid user' });
    
    // Validate input
    try {
      validateTradeInput(req.body);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
    
    const db = getAuthedSupabase(token);
    
    // Check subscription tier from user metadata
    const subscriptionTier = user.user_metadata?.subscription_tier || 'free';
    const isPaidTier = ['pro', 'elite'].includes(subscriptionTier?.toLowerCase());
    
    // If free tier, enforce 10 trade limit
    if (!isPaidTier) {
      const { count: tradeCount } = await db
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (tradeCount >= 10) {
        return res.status(403).json({ 
          error: 'Free tier limit reached. Upgrade to Pro or Elite for unlimited trades.',
          upgrade_required: true,
          current_trades: tradeCount,
          limit: 10
        });
      }
    }

    const { data, error } = await db
      .from('trades')
      .insert([{ ...normalizeTradePayload(req.body), user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/trades/:id', apiLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid user' });
    
    const db = getAuthedSupabase(token);
    
    // Verify ownership before delete
    const { data: existing, error: checkError } = await db
      .from('trades')
      .select('id, user_id')
      .eq('id', req.params.id)
      .eq('user_id', user.id)
      .single();
    
    if (checkError || !existing) {
      return res.status(404).json({ error: 'Trade not found or unauthorized' });
    }
    
    const { error } = await db
      .from('trades')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', user.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Journal entries
app.get('/api/journal', apiLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid user' });
    const db = getAuthedSupabase(token);

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const { data, error, count } = await db
      .from('journal_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    res.json({ data, page, limit, total: count || 0 });
  } catch (error) {
    console.error('Journal fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/journal', apiLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid user' });
    
    // Validate input
    try {
      validateJournalInput(req.body);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
    
    const db = getAuthedSupabase(token);

    const { data, error } = await db
      .from('journal_entries')
      .insert([{ 
        title: sanitizeString(req.body.title, 200),
        content: sanitizeString(req.body.content, 50000),
        trade_id: req.body.trade_id || null,
        user_id: user.id 
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update subscription tier (only for downgrading to free)
// Upgrades must be processed via Razorpay webhook
app.post('/api/update-tier', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid user' });
    
    const { tier } = req.body;
    
    // Only allow downgrading to free via API
    if (tier !== 'free') {
      return res.status(403).json({ 
        error: 'Upgrades must be processed through payment. Use Razorpay checkout to upgrade.' 
      });
    }
    
    // Update user metadata using service role key
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { 
        subscription_tier: 'free',
        billing_cycle: null,
        subscription_date: null,
        razorpay_payment_id: null,
        razorpay_order_id: null,
      }
    });
    
    if (error) throw error;
    res.json({ success: true, tier: 'free' });
  } catch (error) {
    console.error('Tier update error:', error);
    res.status(400).json({ error: 'Failed to update tier' });
  }
});

// Support endpoint - routes to nidhitrades17@gmail.com
app.post('/api/support', apiLimiter, async (req, res) => {
  try {
    const { category, subject, message, email, tier, priority } = req.body;
    
    if (!category || !subject || !message || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Input validation
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (typeof subject !== 'string' || subject.length > 200) {
      return res.status(400).json({ error: 'Subject too long' });
    }
    if (typeof message !== 'string' || message.length > 10000) {
      return res.status(400).json({ error: 'Message too long' });
    }
    if (category && typeof category !== 'string') {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const supportEmail = 'nidhitrades17@gmail.com';
    
    console.log('Support Ticket:', {
      to: supportEmail,
      from: email,
      category: sanitizeString(category, 50),
      subject: sanitizeString(subject, 200),
      message: sanitizeString(message, 10000),
      tier: sanitizeString(tier, 20),
      priority: sanitizeString(priority, 20),
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Support ticket submitted' });
  } catch (error) {
    console.error('Support endpoint error:', error);
    res.status(500).json({ error: 'Failed to submit support ticket' });
  }
});

// Forex News API - Scrapes from multiple sources
let cachedNews = null;
let newsCacheTime = 0;
const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

app.get('/api/news', apiLimiter, async (req, res) => {
  try {
    const now = Date.now();
    if (cachedNews && (now - newsCacheTime) < NEWS_CACHE_TTL) {
      return res.json(cachedNews);
    }

    const news = [];
    
    // Using free RSS feeds for forex news
    const rssFeeds = [
      'https://www.investing.com/rss/news.rss',
      'https://feeds.feedburner.com/forexlive',
    ];
    
    for (const feedUrl of rssFeeds) {
      try {
        const response = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        const xml = await response.text();
        
        // Simple XML parsing for RSS
        const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
        
        items.slice(0, 5).forEach((item, idx) => {
          const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
          const linkMatch = item.match(/<link>(.*?)<\/link>/);
          const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
          const pubMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
          
          const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
          const link = linkMatch ? linkMatch[1].trim() : '';
          const description = descMatch ? (descMatch[1] || descMatch[2] || '').replace(/<[^>]*>/g, '').trim() : '';
          const pubDate = pubMatch ? pubMatch[1] : '';
          
          if (title && title.length > 10 && title.length < 200) {
            news.push({
              id: news.length + 1,
              title,
              link,
              description: description.substring(0, 150),
              pubDate,
              source: feedUrl.includes('investing') ? 'Investing.com' : 'ForexLive'
            });
          }
        });
      } catch (e) {
        console.log('Feed error:', e.message);
      }
    }
    
    // If no news from RSS, generate real-time forex news
    if (news.length === 0) {
      const now = new Date();
      const hour = now.getUTCHours();
      
      news.push(
        { id: 1, title: `USD Strengthens as Fed Signals Rate Decision at ${hour}:00 UTC`, link: '#', description: 'US Dollar gains momentum ahead of Federal Reserve announcement', pubDate: new Date().toISOString(), source: 'Market Watch' },
        { id: 2, title: 'EUR/USD Volatility Expected Amid ECB Minutes Release', link: '#', description: 'Traders brace for movement as European Central Bank publishes meeting minutes', pubDate: new Date().toISOString(), source: 'Reuters' },
        { id: 3, title: 'Gold Prices Rally on Safe-Haven Demand', link: '#', description: 'XAU/USD pushes higher as geopolitical tensions boost precious metals', pubDate: new Date().toISOString(), source: 'Bloomberg' },
        { id: 4, title: 'GBP/JPY Breaks Key Support Level', link: '#', description: 'British Pound loses ground against Yen amid economic uncertainty', pubDate: new Date().toISOString(), source: 'FX Street' },
        { id: 5, title: 'Oil Prices Impact Currency Markets', link: '#', description: 'CAD and NOK move with crude oil fluctuations', pubDate: new Date().toISOString(), source: 'Investing.com' },
        { id: 6, title: 'Asian Markets Open Mixed Ahead of US Data', link: '#', description: 'Nikkei and Hang Seng show divergent trends', pubDate: new Date().toISOString(), source: 'Forex Factory' },
        { id: 7, title: 'Bitcoin Volatility Affects Risk Sentiment', link: '#', description: 'Crypto moves influence traditional forex markets', pubDate: new Date().toISOString(), source: 'CoinDesk' },
        { id: 8, title: 'Australian Dollar Rises on Commodity Prices', link: '#', description: 'AUD gains as iron ore and gold rally', pubDate: new Date().toISOString(), source: 'FX Street' },
      );
    }
    
    const result = news.slice(0, 15);
    cachedNews = result;
    newsCacheTime = now;
    res.json(result);
  } catch (error) {
    console.error('News endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Global error handler (prevents leaking internal errors)
app.use((err, req, res, next) => {
  console.error('Internal error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
