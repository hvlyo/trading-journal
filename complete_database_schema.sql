-- Complete Database Schema for Trading App
-- Run this in your Supabase SQL Editor to set up all tables

-- ===========================================
-- USER SETTINGS TABLE
-- ===========================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS user_settings CASCADE;

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starting_capital DECIMAL(15,2) DEFAULT 0,
  notifications BOOLEAN DEFAULT true,
  email_updates BOOLEAN DEFAULT false,
  auto_backup BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- ===========================================
-- TRADES TABLE
-- ===========================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS trades CASCADE;

-- Create trades table
CREATE TABLE trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('LONG', 'SHORT')),
  leverage INTEGER NOT NULL,
  quantity DECIMAL(20,10) NOT NULL,
  "openPrice" DECIMAL(20,10) NOT NULL,
  "closePrice" DECIMAL(20,10),
  pnl DECIMAL(20,10) NOT NULL,
  "pnlType" TEXT NOT NULL CHECK ("pnlType" IN ('REALIZED', 'UNREALIZED')),
  "openTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "closeTime" TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  "selectedTags" TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades" ON trades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades" ON trades
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trades_asset ON trades(asset);
CREATE INDEX idx_trades_type ON trades(type);

-- ===========================================
-- SMART WITHDRAWAL SETTINGS TABLE
-- ===========================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS smart_withdrawal_settings CASCADE;

-- Create smart_withdrawal_settings table
CREATE TABLE smart_withdrawal_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  reinvest_percentage DECIMAL(5,2) DEFAULT 50.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE smart_withdrawal_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own smart withdrawal settings" ON smart_withdrawal_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own smart withdrawal settings" ON smart_withdrawal_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own smart withdrawal settings" ON smart_withdrawal_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own smart withdrawal settings" ON smart_withdrawal_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_smart_withdrawal_settings_user_id ON smart_withdrawal_settings(user_id);

-- ===========================================
-- WITHDRAWAL TRANSACTIONS TABLE
-- ===========================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS withdrawal_transactions CASCADE;

-- Create withdrawal_transactions table
CREATE TABLE withdrawal_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('WITHDRAW', 'REVERT')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE withdrawal_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own withdrawal transactions" ON withdrawal_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawal transactions" ON withdrawal_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own withdrawal transactions" ON withdrawal_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_withdrawal_transactions_user_id ON withdrawal_transactions(user_id);
CREATE INDEX idx_withdrawal_transactions_timestamp ON withdrawal_transactions(timestamp);

-- ===========================================
-- TRIGGERS AND FUNCTIONS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_withdrawal_settings_updated_at
  BEFORE UPDATE ON smart_withdrawal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SAMPLE DATA (Optional)
-- ===========================================

-- Insert sample user settings (uncomment if you want sample data)
-- INSERT INTO user_settings (user_id, starting_capital, notifications, email_updates, auto_backup, theme)
-- VALUES ('your-user-id-here', 10000.00, true, false, true, 'dark');

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check if tables were created successfully
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_settings', 'trades', 'smart_withdrawal_settings', 'withdrawal_transactions')
ORDER BY table_name;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('user_settings', 'trades', 'smart_withdrawal_settings', 'withdrawal_transactions')
ORDER BY tablename, policyname; 