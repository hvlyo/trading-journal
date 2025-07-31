-- Smart Withdrawal Database Schema
-- Run this in your Supabase SQL editor

-- Smart Withdrawal Settings Table
CREATE TABLE IF NOT EXISTS smart_withdrawal_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  reinvest_percentage DECIMAL(5,2) DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Withdrawal Transactions Table
CREATE TABLE IF NOT EXISTS withdrawal_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('WITHDRAW', 'REVERT')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE smart_withdrawal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for smart_withdrawal_settings
CREATE POLICY "Users can view their own smart withdrawal settings" ON smart_withdrawal_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own smart withdrawal settings" ON smart_withdrawal_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own smart withdrawal settings" ON smart_withdrawal_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own smart withdrawal settings" ON smart_withdrawal_settings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for withdrawal_transactions
CREATE POLICY "Users can view their own withdrawal transactions" ON withdrawal_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawal transactions" ON withdrawal_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own withdrawal transactions" ON withdrawal_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_smart_withdrawal_settings_user_id ON smart_withdrawal_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_transactions_user_id ON withdrawal_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_transactions_timestamp ON withdrawal_transactions(timestamp);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_smart_withdrawal_settings_updated_at
  BEFORE UPDATE ON smart_withdrawal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 