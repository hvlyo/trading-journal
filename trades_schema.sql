-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  type TEXT CHECK (type IN ('LONG', 'SHORT')) NOT NULL,
  leverage INTEGER NOT NULL,
  quantity DECIMAL NOT NULL,
  "openPrice" DECIMAL NOT NULL,
  "closePrice" DECIMAL,
  pnl DECIMAL NOT NULL,
  "pnlType" TEXT CHECK ("pnlType" IN ('REALIZED', 'UNREALIZED')) NOT NULL,
  "openTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "closeTime" TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  "selectedTags" TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own trades
CREATE POLICY "Users can manage their own trades" ON trades
  FOR ALL USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC); 