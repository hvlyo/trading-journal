-- Simple user_settings table creation (safe version)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  starting_capital DECIMAL DEFAULT 0,
  notifications BOOLEAN DEFAULT true,
  email_updates BOOLEAN DEFAULT false,
  auto_backup BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (only if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_settings' 
    AND schemaname = 'public'
  ) THEN
    ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_settings' 
    AND policyname = 'Users can manage their own settings'
  ) THEN
    CREATE POLICY "Users can manage their own settings" ON user_settings
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id); 