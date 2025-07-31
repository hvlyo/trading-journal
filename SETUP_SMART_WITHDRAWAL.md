# Smart Withdrawal Setup Guide

## Quick Setup

To enable the Smart Withdrawal feature, you need to create the required database tables in Supabase.

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Setup SQL
Copy and paste the following SQL into the editor:

```sql
-- Smart Withdrawal Database Setup
-- Run this in your Supabase SQL Editor

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
```

### Step 3: Execute the SQL
1. Click **Run** to execute the SQL
2. You should see a success message
3. Verify tables were created by going to **Database > Tables**

### Step 4: Enable Smart Withdrawal
1. Go to your app's **Settings** page
2. Enable the **Smart Withdrawal** toggle
3. Set your **Total Capital** and **Reinvest Percentage**
4. Save settings

## Troubleshooting

### Error: "Error fetching withdrawal transactions: {}"
**Cause**: Database tables don't exist or RLS policies are not set up correctly.

**Solution**:
1. Follow the setup steps above to create the required tables
2. Verify tables exist in Supabase Dashboard > Database > Tables
3. Check RLS policies are enabled and correct
4. Refresh your app and try again

### Error: "Permission denied"
**Cause**: Row Level Security (RLS) policies are blocking access.

**Solution**:
1. Ensure RLS is enabled on both tables
2. Verify the policies allow authenticated users to access their own data
3. Check that the user is properly authenticated

### Feature not showing on Dashboard
**Cause**: Smart Withdrawal is not enabled in settings.

**Solution**:
1. Go to Settings page
2. Enable "Smart Withdrawal" toggle
3. Set required values (Total Capital, Reinvest %)
4. Save settings

### Available Withdrawals showing $0
**Cause**: No profit calculated or settings not configured.

**Solution**:
1. Ensure you have trading data with profits
2. Check that Smart Withdrawal is enabled in settings
3. Verify Total Capital and Reinvest Percentage are set correctly

## Calculation Logic

Available Withdrawals = (Total Profit × (1 - Reinvest Percentage / 100)) - Net Withdrawn

Where:
- Total Profit = Sum of all realized PnL from trades
- Reinvest Percentage = User-defined percentage (default 50%)
- Net Withdrawn = Total Withdrawals - Total Reverts

## API Functions

The feature uses these API functions in `src/lib/supabase.ts`:

- `smartWithdrawalAPI.getSettings(userId)` - Get user settings
- `smartWithdrawalAPI.saveSettings(settings)` - Save/update settings
- `smartWithdrawalAPI.getTransactions(userId)` - Get transaction history
- `smartWithdrawalAPI.addTransaction(transaction)` - Add new transaction
- `smartWithdrawalAPI.revertTransaction(transactionId)` - Revert a transaction 