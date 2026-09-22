-- ==============================================================================
-- Supabase PostgreSQL Schema for Apex Personal Finance Management System
-- Database Migration Script
-- Compatible with Supabase SQL Editor & standard PostgreSQL 14+
-- ==============================================================================

-- 1. Create Tables
-- ------------------------------------------------------------------------------

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY DEFAULT 'current-user',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member',
  avatar_url TEXT,
  joined_date TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- App Settings
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'current-settings',
  currency TEXT NOT NULL DEFAULT 'USD',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  enable_budget_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  enable_bill_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  enable_goal_milestones BOOLEAN NOT NULL DEFAULT TRUE,
  enable_weekly_summary BOOLEAN NOT NULL DEFAULT TRUE,
  compact_view BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'wallet', 'investment', 'cash')),
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  account_number TEXT,
  institution TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#2563eb',
  currency TEXT NOT NULL DEFAULT 'USD',
  credit_limit NUMERIC(14, 2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'both' CHECK (type IN ('income', 'expense', 'both')),
  icon TEXT NOT NULL DEFAULT 'Folder',
  color TEXT NOT NULL DEFAULT '#64748b',
  budget_limit NUMERIC(14, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  limit_amount NUMERIC(14, 2) NOT NULL,
  spent NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'custom')),
  start_date TEXT,
  end_date TEXT,
  alert_threshold NUMERIC(4, 2) NOT NULL DEFAULT 0.80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Savings Goals
CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount NUMERIC(14, 2) NOT NULL,
  current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  deadline TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  color TEXT NOT NULL DEFAULT '#10b981',
  monthly_contribution NUMERIC(14, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Bills
CREATE TABLE IF NOT EXISTS recurring_bills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  category TEXT NOT NULL,
  due_date TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'yearly', 'weekly')),
  account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  auto_pay BOOLEAN NOT NULL DEFAULT FALSE,
  is_paid_this_month BOOLEAN NOT NULL DEFAULT FALSE,
  provider_logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger', 'success')),
  link_to_view TEXT
);

-- 2. Performance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
CREATE INDEX IF NOT EXISTS idx_savings_goals_deadline ON savings_goals(deadline);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_due_date ON recurring_bills(due_date);

-- 3. Row Level Security (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Permissive policies for application access (anon and authenticated)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to user_profiles') THEN
    CREATE POLICY "Allow full access to user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to app_settings') THEN
    CREATE POLICY "Allow full access to app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to accounts') THEN
    CREATE POLICY "Allow full access to accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to categories') THEN
    CREATE POLICY "Allow full access to categories" ON categories FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to transactions') THEN
    CREATE POLICY "Allow full access to transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to budgets') THEN
    CREATE POLICY "Allow full access to budgets" ON budgets FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to savings_goals') THEN
    CREATE POLICY "Allow full access to savings_goals" ON savings_goals FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to recurring_bills') THEN
    CREATE POLICY "Allow full access to recurring_bills" ON recurring_bills FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to notifications') THEN
    CREATE POLICY "Allow full access to notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
