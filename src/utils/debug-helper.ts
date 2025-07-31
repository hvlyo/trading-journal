// Debug Helper Utility
import { supabase } from '@/lib/supabase'

export const debugHelper = {
  // Check if Supabase client is properly initialized
  checkSupabaseClient: () => {
    try {
      console.log('🔍 Supabase Client Check:')
      console.log('  Client type:', typeof supabase)
      console.log('  Has auth method:', typeof supabase?.auth === 'object')
      console.log('  Has from method:', typeof supabase?.from === 'function')
      return true
    } catch (error) {
      console.error('❌ Supabase client check failed:', error)
      return false
    }
  },

  // Check environment variables
  checkEnvironment: () => {
    console.log('🔍 Environment Check:')
    console.log('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set')
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set')
  },

  // Check database tables
  checkDatabaseTables: async () => {
    try {
      console.log('🔍 Database Tables Check:')
      
      const tables = ['smart_withdrawal_settings', 'user_settings', 'trades', 'withdrawal_transactions']
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('count').limit(1)
          if (error) {
            console.log(`  ${table}: ❌ Error - ${error.message}`)
          } else {
            console.log(`  ${table}: ✅ Accessible`)
          }
        } catch (err) {
          console.log(`  ${table}: ❌ Exception - ${err}`)
        }
      }
    } catch (error) {
      console.error('❌ Database check failed:', error)
    }
  },

  // Check authentication status
  checkAuth: async () => {
    try {
      console.log('🔍 Authentication Check:')
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.log('  Session: ❌ Error -', error.message)
      } else if (session) {
        console.log('  Session: ✅ Authenticated -', session.user.email)
      } else {
        console.log('  Session: ℹ️ Not authenticated')
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error)
    }
  },

  // Run all checks
  runAllChecks: async () => {
    console.log('🚀 Running Debug Checks...')
    console.log('='.repeat(50))
    
    debugHelper.checkEnvironment()
    console.log('')
    
    debugHelper.checkSupabaseClient()
    console.log('')
    
    await debugHelper.checkDatabaseTables()
    console.log('')
    
    await debugHelper.checkAuth()
    console.log('')
    
    console.log('='.repeat(50))
    console.log('✅ Debug checks completed')
  }
} 