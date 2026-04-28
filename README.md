# ChronoTrade - Full Stack Trading Journal

A professional trading journal with AI-powered insights, built with free resources.

## Tech Stack (All Free)

| Service | Free Tier | Cost |
|---------|----------|------|
| **Database** | Supabase | 500MB, 100k rows/month |
| **Auth** | Supabase Auth | Unlimited users |
| **AI** | Ollama (local) | $0 |
| **Backend** | Node.js/Express | $0 (localhost) |
| **Frontend** | Vercel | $0 |
| **Payments** | Stripe | Only on fees |

## Quick Start

### 1. Clone & Install
```bash
cd chronotrade-v2/frontend
npm install
```

### 2. Set Up Supabase (Free Database)
1. Go to [supabase.com](https://supabase.com) → Create project
2. Get your URL and anon key from Settings → API
3. Create `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
4. Run SQL from `backend/SUPABASE_SCHEMA.sql` in Supabase SQL Editor

### 3. Set Up Ollama (Free AI)
```bash
# Install Ollama (Windows/Mac/Linux)
ollama pull qwen3:8b
ollama serve  # Runs on port 11434
```

### 4. Run Development
```bash
# Terminal 1: Backend
cd backend
npm install
cp .env.example .env  # Add your keys
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Deploy Free
- **Frontend**: Vercel (free)
- **Backend**: Railway render.com (free tier) or local
- **Database**: Supabase (free tier)

## Features

### Core
- 📊 Live Trading Dashboard
- 📝 Trade Journal with rich text
- 📈 Performance Analytics
- 🔐 Authentication (Supabase)

### AI Features (Local - No API Costs)
- 🧠 Behavioral Pattern Detection
- 💡 AI Insights & Recommendations
- 📉 Leak Identification
- 🎯 Strategy Performance Analysis

### Industry-Leading
- ⏰ Time-of-Day Analysis
- 📅 Day-of-Week Analysis
- 🗓️ Session Analysis
- 📊 Multi-Timeframe Stats
- 🎭 Emotion Tracking
- 📋 Journal Tags

## Project Structure

```
chronotrade-v2/
├── frontend/           # React + Vite
│   └── src/
│       ├── pages/    # Landing, Dashboard, Journal, Auth
│       ├── components/ui/  # UI components
│       ├── lib/     # API, Supabase, Ollama, Analytics
│       └── context/ # Auth context
├── backend/          # Express API
│   └── src/
│       └── index.js # API routes
└── SUPABASE_SCHEMA.sql  # Database setup
```

## API Keys Setup

1. **Supabase**: Project → Settings → API
2. **Stripe** (optional): Developers → API Keys (test mode free)

## Environment Variables

```env
# Frontend (.env.local)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3001/api

# Backend (.env)
SUPABASE_URL=
SUPABASE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## License

MIT