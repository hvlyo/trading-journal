import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leurhwzhedghjkyhpwxk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxldXJod3poZWRnaGpreWhwd3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjI5NTAsImV4cCI6MjA2OTUzODk1MH0.wknGQYDaoWjxCWkaiZ0ernjL7tKK3_eBC_29nOI_-UM'

// Debug logging (only in browser)
if (typeof window !== 'undefined') {
  console.log('🔧 Supabase Client Initialization:')
  console.log('  URL:', supabaseUrl ? '✅ Set' : '❌ Not set')
  console.log('  ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Not set')
}

let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[HIDDEN]' : 'Not set')
  
  // Create a mock client for development
  const mockClient = {
    auth: {
      signUp: async () => ({ data: null, error: { message: 'Environment variables not configured' } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Environment variables not configured' } }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }
  
  console.warn('⚠️ Using mock Supabase client. Please configure your environment variables.')
  supabase = mockClient
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    if (typeof window !== 'undefined') {
      console.log('✅ Supabase client created successfully')
    }
  } catch (error) {
    if (typeof window !== 'undefined') {
      console.error('❌ Failed to create Supabase client:', error)
    }
    throw error
  }
}

// Smart Withdrawal Types
export interface SmartWithdrawalSettings {
  id?: string
  user_id: string
  enabled: boolean
  reinvest_percentage: number
  created_at?: string
  updated_at?: string
}

export interface WithdrawalTransaction {
  id?: string
  user_id: string
  amount: number
  action: 'WITHDRAW' | 'REVERT'
  timestamp: string
  description?: string
}

// Trade Types
export interface Trade {
  id?: string
  user_id: string
  asset: string
  type: 'LONG' | 'SHORT'
  leverage: number
  quantity: number
  openPrice: number
  closePrice: number | null
  pnl: number
  pnlType: 'REALIZED' | 'UNREALIZED'
  openTime: string
  closeTime: string | null
  notes: string
  selectedTags: string[]
  created_at?: string
  updated_at?: string
}

// User Settings Types
export interface UserSettings {
  id?: string
  user_id: string
  starting_capital: number
  notifications: boolean
  email_updates: boolean
  auto_backup: boolean
  theme: string
  created_at?: string
  updated_at?: string
}

// Smart Withdrawal Helper Functions
export const smartWithdrawalAPI = {
  // Get user's smart withdrawal settings
  async getSettings(userId: string): Promise<SmartWithdrawalSettings | null> {
    try {
      console.log('🔍 Fetching smart withdrawal settings for user ID:', userId)
      console.log('🔍 Supabase client type:', typeof supabase)
      console.log('🔍 Supabase client has from method:', typeof supabase?.from === 'function')
      
      // Check if supabase client is properly initialized
      if (!supabase || typeof supabase.from !== 'function') {
        console.error('❌ Supabase client is not properly initialized!')
        throw new Error('Supabase client is not properly initialized')
      }
      
      console.log('🔍 About to make Supabase query...')
      
      // Wrap the query in a try-catch to catch any network or client issues
      let queryResult
      try {
        queryResult = await supabase
          .from('smart_withdrawal_settings')
          .select('*')
          .eq('user_id', userId)
          .single()
        console.log('🔍 Query completed, result:', queryResult)
      } catch (queryError) {
        console.error('❌ Query failed with exception:', queryError)
        throw queryError
      }
      
      const { data, error } = queryResult
      
      if (error) {
        // Log error details individually to avoid serialization issues
        console.error('❌ Supabase error fetching smart withdrawal settings:')
        console.error('  Message:', error.message)
        console.error('  Code:', error.code)
        console.error('  Details:', error.details)
        console.error('  Hint:', error.hint)
        console.error('  Full error object:', error)
        
        // Check if table doesn't exist
        if (error.code === '42P01') {
          console.error('❌ Table "smart_withdrawal_settings" does not exist. Please run the setup SQL.')
          console.error('📋 Run the SQL from smart_withdrawal_schema.sql in your Supabase SQL Editor')
        }
        
        // Check for RLS policy issues
        if (error.code === '42501') {
          console.error('❌ Permission denied. Check Row Level Security (RLS) policies.')
        }
        
        // Check for no rows found (this is normal for new users)
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No smart withdrawal settings found for user. This is normal for new users.')
          return null
        }
        
        // For other errors, log them but don't throw (to avoid breaking the UI)
        console.warn('⚠️ Supabase query returned error, but continuing:', error.message)
        return null
      }
      
      console.log('✅ Smart withdrawal settings fetched successfully:', data)
      return data
    } catch (error) {
      console.error('❌ Error in getSettings:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      // Re-throw the error so it can be handled by the calling function
      throw error
    }
  },

  // Save or update smart withdrawal settings
  async saveSettings(settings: SmartWithdrawalSettings): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('smart_withdrawal_settings')
        .upsert(settings, { onConflict: 'user_id' })
      
      if (error) {
        console.error('Error saving smart withdrawal settings:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // Check if table doesn't exist
        if (error.code === '42P01') {
          console.error('Table "smart_withdrawal_settings" does not exist. Please run the setup SQL.')
          console.error('Run the SQL from smart_withdrawal_schema.sql in your Supabase SQL Editor')
        }
        
        // Check for RLS policy issues
        if (error.code === '42501') {
          console.error('Permission denied. Check Row Level Security (RLS) policies.')
        }
        
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in saveSettings:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      return false
    }
  },

  // Get withdrawal transactions for a user
  async getTransactions(userId: string): Promise<WithdrawalTransaction[]> {
    try {
      console.log('🔍 Fetching withdrawal transactions for user ID:', userId)
      
      const { data, error } = await supabase
        .from('withdrawal_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
      
      if (error) {
        // Log error details individually to avoid serialization issues
        console.error('❌ Supabase error fetching withdrawal transactions:')
        console.error('  Message:', error.message)
        console.error('  Code:', error.code)
        console.error('  Details:', error.details)
        console.error('  Hint:', error.hint)
        console.error('  Full error object:', error)
        
        // Check if table doesn't exist
        if (error.code === '42P01') {
          console.error('❌ Table "withdrawal_transactions" does not exist. Please run the setup SQL.')
          console.error('📋 Run the SQL from smart_withdrawal_schema.sql in your Supabase SQL Editor')
        }
        
        // Check for RLS policy issues
        if (error.code === '42501') {
          console.error('❌ Permission denied. Check Row Level Security (RLS) policies.')
        }
        
        // For other errors, log them but don't throw (to avoid breaking the UI)
        console.warn('⚠️ Supabase query returned error, but continuing:', error.message)
        return []
      }
      
      console.log('✅ Withdrawal transactions fetched successfully:', data)
      return data || []
    } catch (error) {
      console.error('❌ Error in getTransactions:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      // Re-throw the error so it can be handled by the calling function
      throw error
    }
  },

  // Add a new withdrawal transaction
  async addTransaction(transaction: WithdrawalTransaction): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('withdrawal_transactions')
        .insert(transaction)
      
      if (error) {
        console.error('Error adding withdrawal transaction:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // Check if table doesn't exist
        if (error.code === '42P01') {
          console.error('Table "withdrawal_transactions" does not exist. Please run the setup SQL.')
          console.error('Run the SQL from smart_withdrawal_schema.sql in your Supabase SQL Editor')
        }
        
        // Check for RLS policy issues
        if (error.code === '42501') {
          console.error('Permission denied. Check Row Level Security (RLS) policies.')
        }
        
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in addTransaction:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      return false
    }
  },

  // Revert a withdrawal transaction
  async revertTransaction(transactionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('withdrawal_transactions')
        .delete()
        .eq('id', transactionId)
      
      if (error) {
        console.error('Error reverting withdrawal transaction:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // Check if table doesn't exist
        if (error.code === '42P01') {
          console.error('Table "withdrawal_transactions" does not exist. Please run the setup SQL.')
          console.error('Run the SQL from smart_withdrawal_schema.sql in your Supabase SQL Editor')
        }
        
        // Check for RLS policy issues
        if (error.code === '42501') {
          console.error('Permission denied. Check Row Level Security (RLS) policies.')
        }
        
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in revertTransaction:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      return false
    }
  }
}

// Trade API Functions
export const tradeAPI = {
  // Save a new trade
  async saveTrade(trade: Trade): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trades')
        .insert(trade)
      
      if (error) {
        console.error('Error saving trade:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // Check if table doesn't exist
        if (error.code === '42P01') {
          console.error('Table "trades" does not exist. Please create the trades table.')
          console.error('Run the following SQL in your Supabase SQL Editor:')
          console.error(`
            CREATE TABLE trades (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
              asset TEXT NOT NULL,
              type TEXT CHECK (type IN ('LONG', 'SHORT')) NOT NULL,
              leverage INTEGER NOT NULL,
              quantity DECIMAL NOT NULL,
              open_price DECIMAL NOT NULL,
              close_price DECIMAL,
              pnl DECIMAL NOT NULL,
              pnl_type TEXT CHECK (pnl_type IN ('REALIZED', 'UNREALIZED')) NOT NULL,
              open_time TIMESTAMP WITH TIME ZONE NOT NULL,
              close_time TIMESTAMP WITH TIME ZONE,
              notes TEXT,
              selected_tags TEXT[],
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- Enable RLS
            ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
            
            -- Create policy for users to manage their own trades
            CREATE POLICY "Users can manage their own trades" ON trades
              FOR ALL USING (auth.uid() = user_id);
          `)
        }
        
        // Check for RLS policy issues
        if (error.code === '42501') {
          console.error('Permission denied. Check Row Level Security (RLS) policies.')
        }
        
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in saveTrade:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      return false
    }
  },

  // Get all trades for a user
  async getTrades(userId: string): Promise<Trade[]> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching trades:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // Check if table doesn't exist
        if (error.code === '42P01') {
          console.error('Table "trades" does not exist. Please create the trades table.')
        }
        
        // Check for RLS policy issues
        if (error.code === '42501') {
          console.error('Permission denied. Check Row Level Security (RLS) policies.')
        }
        
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getTrades:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      return []
    }
  },

  // Update a trade
  async updateTrade(tradeId: string, updates: Partial<Trade>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', tradeId)
      
      if (error) {
        console.error('Error updating trade:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in updateTrade:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      return false
    }
  },

  // Delete a trade
  async deleteTrade(tradeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
      
      if (error) {
        console.error('Error deleting trade:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in deleteTrade:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      return false
    }
  }
}

// Settings API Functions
export const settingsAPI = {
  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      console.log('🔍 Fetching user settings for user ID:', userId)
      console.log('🔍 Supabase client type:', typeof supabase)
      console.log('🔍 Supabase client has from method:', typeof supabase?.from === 'function')
      
      // Check if supabase client is properly initialized
      if (!supabase || typeof supabase.from !== 'function') {
        console.error('❌ Supabase client is not properly initialized!')
        throw new Error('Supabase client is not properly initialized')
      }
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        // Log error details individually to avoid serialization issues
        console.error('❌ Supabase error fetching user settings:')
        console.error('  Message:', error.message)
        console.error('  Code:', error.code)
        console.error('  Details:', error.details)
        console.error('  Hint:', error.hint)
        console.error('  Full error object:', error)
        
        // Check if table doesn't exist
        if (error.code === '42P01') {
          console.error('❌ Table "user_settings" does not exist. Please create the user_settings table.')
          console.error('📋 Run the following SQL in your Supabase SQL Editor:')
          console.error(`
            CREATE TABLE user_settings (
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
            
            -- Enable RLS
            ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
            
            -- Create policy for users to manage their own settings
            CREATE POLICY "Users can manage their own settings" ON user_settings
              FOR ALL USING (auth.uid() = user_id);
          `)
        }
        
        // Check for RLS policy issues
        if (error.code === '42501') {
          console.error('❌ Permission denied. Check Row Level Security (RLS) policies.')
        }
        
        // Check for no rows found (this is normal for new users)
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No settings found for user. This is normal for new users.')
          return null
        }
        
        // For other errors, log them but don't throw (to avoid breaking the UI)
        console.warn('⚠️ Supabase query returned error, but continuing:', error.message)
        return null
      }
      
      console.log('✅ User settings fetched successfully:', data)
      return data
    } catch (error) {
      console.error('❌ Error in getUserSettings:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      // Re-throw the error so it can be handled by the calling function
      throw error
    }
  },

  // Save or update user settings
  async saveUserSettings(settings: UserSettings): Promise<boolean> {
    try {
      console.log('🔍 Saving user settings:', settings)
      
      const { error } = await supabase
        .from('user_settings')
        .upsert(settings, { onConflict: 'user_id' })
      
      if (error) {
        // Log error details individually to avoid serialization issues
        console.error('❌ Supabase error saving user settings:')
        console.error('  Message:', error.message)
        console.error('  Code:', error.code)
        console.error('  Details:', error.details)
        console.error('  Hint:', error.hint)
        console.error('  Full error object:', error)
        
        // Check if table doesn't exist
        if (error.code === '42P01') {
          console.error('❌ Table "user_settings" does not exist. Please create the user_settings table.')
          console.error('📋 Run the following SQL in your Supabase SQL Editor:')
          console.error(`
            CREATE TABLE user_settings (
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
            
            -- Enable RLS
            ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
            
            -- Create policy for users to manage their own settings
            CREATE POLICY "Users can manage their own settings" ON user_settings
              FOR ALL USING (auth.uid() = user_id);
          `)
        }
        
        // Check for RLS policy issues
        if (error.code === '42501') {
          console.error('❌ Permission denied. Check Row Level Security (RLS) policies.')
        }
        
        // Check for column name issues
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.error('❌ Column name mismatch. Check if database schema matches code expectations.')
        }
        
        return false
      }
      
      console.log('✅ User settings saved successfully')
      return true
    } catch (error) {
      console.error('❌ Error in saveUserSettings:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      return false
    }
  }
}

export { supabase } 