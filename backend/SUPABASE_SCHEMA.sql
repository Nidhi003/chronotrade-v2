-- ============================================================================
-- COMPLETE SUPABASE SETUP - Run this EXACTLY as written
-- ============================================================================

-- STEP 1: Enable UUID (run this first)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 2: Create profiles table (IF NOT EXISTS avoids error if exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create trades table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  entry_price NUMERIC,
  exit_price NUMERIC,
  quantity NUMERIC,
  pnl NUMERIC,
  status TEXT NOT NULL,
  strategy TEXT,
  notes TEXT,
  risk_amount NUMERIC,
  swap_fee NUMERIC,
  commission NUMERIC,
  timeframe TEXT,
  confidence TEXT,
  synced BOOLEAN DEFAULT FALSE,
  cloud_id TEXT,
  imported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Create journal table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  mood_before INTEGER,
  mood_after INTEGER,
  tags TEXT[] DEFAULT '{}',
  linked_trades UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4B: Create subscriptions table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT DEFAULT 'free',
  status TEXT DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4C: Add columns for existing projects that already had older tables
-- ============================================================================
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS risk_amount NUMERIC;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS swap_fee NUMERIC;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS commission NUMERIC;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS timeframe TEXT;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS confidence TEXT;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT FALSE;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS cloud_id TEXT;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS imported BOOLEAN DEFAULT FALSE;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS mood_before INTEGER;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS mood_after INTEGER;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS linked_trades UUID[] DEFAULT '{}';
DROP INDEX IF EXISTS trades_cloud_id_key;
CREATE UNIQUE INDEX trades_cloud_id_key ON public.trades (cloud_id);

-- STEP 5: Enable RLS (drop first if exists, then enable)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create policies (DROP first to avoid errors, then CREATE)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can view own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own trades" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON public.trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trades FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own journal" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- STEP 7: Create trigger (DROP first, then CREATE)
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 8: Add foreign keys (if needed)
-- ============================================================================
ALTER TABLE public.trades DROP CONSTRAINT IF EXISTS trades_user_fkey;
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_user_fkey;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_fkey;

ALTER TABLE public.trades ADD CONSTRAINT trades_user_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.journal_entries ADD CONSTRAINT journal_user_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
