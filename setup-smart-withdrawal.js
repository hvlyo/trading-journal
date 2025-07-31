#!/usr/bin/env node

/**
 * Smart Withdrawal Database Setup Script
 * 
 * This script provides the SQL commands needed to set up the Smart Withdrawal feature.
 * Copy and paste the SQL output into your Supabase SQL Editor.
 */

const setupSQL = `
-- Smart Withdrawal Database Setup
-- Copy and paste this entire block into your Supabase SQL Editor

-- Create smart withdrawal settings table
CREATE TABLE IF NOT EXISTS smart_withdrawal_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  total_capital DECIMAL(15,2) DEFAULT 0,
  reinvest_percentage DECIMAL(5,2) DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create withdrawal transactions table
CREATE TABLE IF NOT EXISTS withdrawal_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  action TEXT CHECK (action IN ('WITHDRAW', 'REVERT')) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- Enable Row Level Security
ALTER TABLE smart_withdrawal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for smart_withdrawal_settings
CREATE POLICY "Users can view their own settings" ON smart_withdrawal_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON smart_withdrawal_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON smart_withdrawal_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for withdrawal_transactions
CREATE POLICY "Users can view their own transactions" ON withdrawal_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON withdrawal_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON withdrawal_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_smart_withdrawal_settings_user_id ON smart_withdrawal_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_transactions_user_id ON withdrawal_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_transactions_timestamp ON withdrawal_transactions(timestamp);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_smart_withdrawal_settings_updated_at
  BEFORE UPDATE ON smart_withdrawal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 'smart_withdrawal_settings' as table_name, COUNT(*) as row_count FROM smart_withdrawal_settings
UNION ALL
SELECT 'withdrawal_transactions' as table_name, COUNT(*) as row_count FROM withdrawal_transactions;
`;

console.log('🚀 Smart Withdrawal Database Setup');
console.log('=====================================\n');
console.log('To set up the Smart Withdrawal feature, follow these steps:\n');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the following SQL:\n');
console.log(setupSQL);
console.log('\n4. Click "Run" to execute the SQL');
console.log('5. Verify the tables were created by checking the Database > Tables section');
console.log('\n✅ Setup complete! The Smart Withdrawal feature should now work properly.');
console.log('\n📖 For more information, see SETUP_SMART_WITHDRAWAL.md'); 