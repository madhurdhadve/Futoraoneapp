-- ==============================================================================
-- 🚀 FUTORA ENGAGEMENT ENGINE: MASTER MIGRATION (FINAL FIX)
-- Completely Idempotent: Handles existing tables, policies, and constraints safely.
-- ==============================================================================

-- 1. Create User Wallet Table
CREATE TABLE IF NOT EXISTS public.user_wallet (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coins INT NOT NULL DEFAULT 0,
  rupee_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Safely add 'updated_at' column if it doesn't exist (Fix for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_wallet' AND column_name = 'updated_at') THEN
        ALTER TABLE public.user_wallet ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Safely add constraints
DO $$
BEGIN
    ALTER TABLE public.user_wallet ADD CONSTRAINT user_wallet_coins_check CHECK (coins >= 0);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.user_wallet ADD CONSTRAINT user_wallet_rupee_balance_check CHECK (rupee_balance >= 0);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create Coin Transactions Table
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('EARN', 'SPEND')),
  coins INT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

DO $$
BEGIN
    ALTER TABLE public.coin_transactions ADD CONSTRAINT coin_transactions_coins_check CHECK (coins > 0);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_date ON public.coin_transactions (user_id, created_at DESC);

-- 3. Create Feature Locks Table
CREATE TABLE IF NOT EXISTS public.feature_locks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT UNIQUE,
  required_coins INT NOT NULL
);

DO $$
BEGIN
    ALTER TABLE public.feature_locks ADD CONSTRAINT feature_locks_required_coins_check CHECK (required_coins >= 0);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Insert default locked features
INSERT INTO public.feature_locks (feature_name, required_coins)
VALUES ('tech_match', 1000)
ON CONFLICT (feature_name) DO NOTHING;

-- 4. Create User Feature Unlocks Table
CREATE TABLE IF NOT EXISTS public.user_feature_unlocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, feature_name)
);

-- 5. Enable RLS (Safe to run multiple times)
ALTER TABLE public.user_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feature_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_locks ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Drop & Recreate)
-- This fixes the "policy already exists" error
DROP POLICY IF EXISTS "User can view own wallet" ON public.user_wallet;
DROP POLICY IF EXISTS "User can update own wallet" ON public.user_wallet;
DROP POLICY IF EXISTS "User can view own transactions" ON public.coin_transactions;
DROP POLICY IF EXISTS "User can view unlocked features" ON public.user_feature_unlocks;
DROP POLICY IF EXISTS "Everyone can view feature locks" ON public.feature_locks;

CREATE POLICY "User can view own wallet" ON public.user_wallet FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User can view own transactions" ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can view unlocked features" ON public.user_feature_unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view feature locks" ON public.feature_locks FOR SELECT USING (true);

-- 7. Functions and Triggers

-- Trigger: Handle New User Wallet
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_wallet (id, coins, rupee_balance, reward_claimed)
  VALUES (NEW.id, 1000, 1, false)
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.coin_transactions WHERE user_id = NEW.id AND reason = 'Signup Bonus - Scan & Earn ₹1') THEN
      INSERT INTO public.coin_transactions (user_id, type, coins, reason)
      VALUES (NEW.id, 'EARN', 1000, 'Signup Bonus - Scan & Earn ₹1');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Setup
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- RPC: Unlock Feature
CREATE OR REPLACE FUNCTION public.unlock_feature(p_feature_name TEXT)
RETURNS TEXT AS $$
DECLARE
  required INT;
  current_coins INT;
BEGIN
  -- If already unlocked, do nothing
  IF EXISTS (
    SELECT 1
    FROM public.user_feature_unlocks
    WHERE user_id = auth.uid()
    AND feature_name = p_feature_name
  ) THEN
    RETURN 'ALREADY_UNLOCKED';
  END IF;

  SELECT required_coins INTO required
  FROM public.feature_locks
  WHERE feature_name = p_feature_name;

  SELECT coins INTO current_coins
  FROM public.user_wallet
  WHERE id = auth.uid();

  IF current_coins < required THEN
    RETURN 'INSUFFICIENT_COINS';
  END IF;

  -- Deduct coins
  UPDATE public.user_wallet
  SET coins = coins - required,
      updated_at = NOW()
  WHERE id = auth.uid();

  -- Log transaction
  INSERT INTO public.coin_transactions
  (user_id, type, coins, reason)
  VALUES
  (auth.uid(), 'SPEND', required, 'Unlocked ' || p_feature_name);

  -- Unlock permanently
  INSERT INTO public.user_feature_unlocks
  (user_id, feature_name)
  VALUES
  (auth.uid(), p_feature_name);

  RETURN 'UNLOCKED';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ONE-TIME MIGRATION (Idempotent)
DO $$
BEGIN
    -- Create missing wallets
    INSERT INTO public.user_wallet (id, coins, rupee_balance, reward_claimed)
    SELECT id, 1000, 1, false FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.user_wallet w WHERE w.id = u.id);

    -- Reset 0-coin wallets
    UPDATE public.user_wallet
    SET coins = 1000, rupee_balance = 1, reward_claimed = false
    WHERE coins = 0;

    -- Award Transaction logs
    INSERT INTO public.coin_transactions (user_id, type, coins, reason)
    SELECT id, 'EARN', 1000, 'Campus Relaunch Bonus - ₹1'
    FROM public.user_wallet w
    WHERE reward_claimed = false
    AND NOT EXISTS (
        SELECT 1 FROM public.coin_transactions ct 
        WHERE ct.user_id = w.id AND ct.reason = 'Campus Relaunch Bonus - ₹1'
    );
    
    -- Force Relock
    DELETE FROM public.user_feature_unlocks WHERE feature_name = 'tech_match';
END $$;

-- 9. GAMES MASTER TABLE
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_key TEXT UNIQUE,
  game_name TEXT,
  coin_reward INT DEFAULT 10,
  active BOOLEAN DEFAULT true
);

-- 10. GAME SESSIONS
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_key TEXT,
  result TEXT CHECK (result IN ('WIN','LOSE','DRAW')),
  coins_awarded INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_limit ON public.game_sessions (user_id, game_key, created_at);

-- 11. Security for Games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Read games" ON public.games;
DROP POLICY IF EXISTS "User can read own sessions" ON public.game_sessions;
DROP POLICY IF EXISTS "User can insert own sessions" ON public.game_sessions;

-- Create Policies
CREATE POLICY "Read games" ON public.games FOR SELECT USING (true);
CREATE POLICY "User can read own sessions" ON public.game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own sessions" ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. Insert/Update Games
INSERT INTO public.games (game_key, game_name, coin_reward)
VALUES
('tic_tac_toe', 'Tic Tac Toe', 10),
('rock_paper_scissors', 'Rock Paper Scissors', 10),
('memory_match', 'Memory Match', 10),
('code_duel', 'Code Duel', 10),
('quiz_master', 'Quiz Master', 10)
ON CONFLICT (game_key) DO UPDATE
SET coin_reward = EXCLUDED.coin_reward;

-- 13. Helper: Check Daily Limit
CREATE OR REPLACE FUNCTION public.can_reward_game(p_game_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  win_count INT;
BEGIN
  SELECT COUNT(*) INTO win_count
  FROM public.game_sessions
  WHERE user_id = auth.uid()
  AND game_key = p_game_key
  AND result = 'WIN'
  AND created_at >= CURRENT_DATE;

  RETURN win_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. CORE REWARD RPC (Secured)
CREATE OR REPLACE FUNCTION public.reward_game_win(p_game_key TEXT)
RETURNS JSONB AS $$
DECLARE
  reward INT;
  v_game_name TEXT;
  new_balance INT;
BEGIN
  -- Anti-Race Lock
  PERFORM pg_advisory_xact_lock(hashtext('game_reward_' || auth.uid()::text || '_' || p_game_key));

  SELECT coin_reward, game_name INTO reward, v_game_name
  FROM public.games
  WHERE game_key = p_game_key AND active = true;

  IF reward IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or inactive game');
  END IF;

  -- Daily Limit Check
  IF NOT public.can_reward_game(p_game_key) THEN
    -- Log with 0 coins
    INSERT INTO public.game_sessions (user_id, game_key, result, coins_awarded)
    VALUES (auth.uid(), p_game_key, 'WIN', 0);
    RETURN jsonb_build_object('success', false, 'message', 'Daily limit reached for ' || v_game_name || '. Come back tomorrow!');
  END IF;

  -- Execute Reward
  UPDATE public.user_wallet
  SET coins = coins + reward, updated_at = now()
  WHERE id = auth.uid()
  RETURNING coins INTO new_balance;

  INSERT INTO public.coin_transactions (user_id, type, coins, reason)
  VALUES (auth.uid(), 'EARN', reward, 'Game Win: ' || v_game_name);

  INSERT INTO public.game_sessions (user_id, game_key, result, coins_awarded)
  VALUES (auth.uid(), p_game_key, 'WIN', reward);

  RETURN jsonb_build_object(
    'success', true, 
    'coins', reward, 
    'message', 'You won ' || reward || ' coins!',
    'new_balance', new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Helper RPC: Mark Reward Claimed (Atomic Popup Handling)
CREATE OR REPLACE FUNCTION public.mark_reward_claimed()
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_wallet
  SET reward_claimed = true, updated_at = now()
  WHERE id = auth.uid()
  AND reward_claimed = false; -- Idempotent check

  RETURN found; -- Returns true if a row was updated
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely claim the launch reward popup
-- Returns TRUE if the popup should be shown (first time claim)
-- Returns FALSE if already claimed
CREATE OR REPLACE FUNCTION public.claim_launch_reward_popup()
RETURNS BOOLEAN AS $$
DECLARE
  should_show BOOLEAN;
BEGIN
  -- Lock the row for this user to prevent race conditions
  -- We select ONLY the reward_claimed flag
  SELECT NOT reward_claimed
  INTO should_show
  FROM public.user_wallet
  WHERE id = auth.uid()
  FOR UPDATE;

  -- If already claimed (or row locked/missing), return false
  IF should_show IS NULL OR NOT should_show THEN
    RETURN false;
  END IF;

  -- Mark as claimed IMMEDIATELY
  UPDATE public.user_wallet
  SET reward_claimed = true,
      updated_at = NOW()
  WHERE id = auth.uid();

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.claim_launch_reward_popup() TO authenticated;
