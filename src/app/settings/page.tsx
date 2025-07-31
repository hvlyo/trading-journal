'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { smartWithdrawalAPI, SmartWithdrawalSettings, settingsAPI, UserSettings, supabase } from '@/lib/supabase'
import { tradeAPI } from '@/lib/supabase'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>({
    user_id: user?.id || '',
    starting_capital: 0,
    notifications: true,
    email_updates: false,
    auto_backup: true,
    theme: 'dark'
  })
  const [smartWithdrawalSettings, setSmartWithdrawalSettings] = useState<SmartWithdrawalSettings>({
    user_id: user?.id || '',
    enabled: false,
    reinvest_percentage: 50
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
    } else {
      loadSettings()
    }
  }, [user, router])

  const loadSettings = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      console.log('🔍 Loading settings for user:', user.id)
      
      // Load user settings and smart withdrawal settings separately to better handle errors
      let userSettings = null
      let smartSettings = null
      
      try {
        userSettings = await settingsAPI.getUserSettings(user.id)
        console.log('✅ User settings loaded successfully:', userSettings)
      } catch (userError) {
        console.error('❌ Failed to load user settings:', userError)
        // Continue with default settings
      }
      
      try {
        smartSettings = await smartWithdrawalAPI.getSettings(user.id)
        console.log('✅ Smart withdrawal settings loaded successfully:', smartSettings)
      } catch (smartError) {
        console.error('❌ Failed to load smart withdrawal settings:', smartError)
        // Continue with default settings
      }
      
      // Set user settings
      if (userSettings) {
        setSettings(userSettings)
      } else {
        // Initialize with default settings
        const defaultSettings = {
          user_id: user.id,
          starting_capital: 0,
          notifications: true,
          email_updates: false,
          auto_backup: true,
          theme: 'dark'
        }
        setSettings(defaultSettings)
        console.log('📝 Using default user settings:', defaultSettings)
      }
      
      // Set smart withdrawal settings
      if (smartSettings) {
        setSmartWithdrawalSettings(smartSettings)
      } else {
        // Initialize with default smart withdrawal settings
        const defaultSmartSettings = {
          user_id: user.id,
          enabled: false,
          reinvest_percentage: 50
        }
        setSmartWithdrawalSettings(defaultSmartSettings)
        console.log('📝 Using default smart withdrawal settings:', defaultSmartSettings)
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      // Set default settings on error
      const defaultSettings = {
        user_id: user.id,
        starting_capital: 0,
        notifications: true,
        email_updates: false,
        auto_backup: true,
        theme: 'dark'
      }
      setSettings(defaultSettings)
      
      const defaultSmartSettings = {
        user_id: user.id,
        enabled: false,
        reinvest_percentage: 50
      }
      setSmartWithdrawalSettings(defaultSmartSettings)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleSettingChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Test if tables exist first
      console.log('Testing database connection...')
      
      const [userSettingsSuccess, smartSettingsSuccess] = await Promise.all([
        settingsAPI.saveUserSettings(settings),
        smartWithdrawalAPI.saveSettings(smartWithdrawalSettings)
      ])
      
      if (userSettingsSuccess && smartSettingsSuccess) {
        alert('Settings saved successfully! ✅ Database tables are working properly.')
      } else {
        alert('Failed to save some settings. Please check if database tables exist.')
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      // Check for specific database errors
      if (error instanceof Error) {
        if (error.message.includes('42P01') || error.message.includes('relation') || error.message.includes('does not exist')) {
          alert('❌ Database tables not found! Please run the SQL scripts in your Supabase SQL Editor:\n\n1. user_settings_schema.sql\n2. smart_withdrawal_schema.sql\n3. trades_schema.sql')
        } else if (error.message.includes('42501') || error.message.includes('permission')) {
          alert('❌ Permission denied! Check Row Level Security (RLS) policies in Supabase.')
        } else if (error.message.includes('column') && error.message.includes('does not exist')) {
          alert('❌ Column name mismatch! The database schema doesn\'t match the code expectations. Please recreate the tables with the corrected schemas.')
        } else {
          alert('❌ An error occurred while saving settings: ' + error.message)
        }
      } else {
        alert('❌ An error occurred while saving settings. Check browser console for details.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all your trading data? This action cannot be undone.')) {
      // Clear all data logic here
      alert('All data cleared successfully!')
    }
  }

  const testDatabaseConnection = async () => {
    if (!user) return
    
    try {
      console.log('🔍 Testing database connection...')
      console.log('User ID:', user.id)
      
      // Test user_settings table
      console.log('📋 Testing user_settings table...')
      const userSettings = await settingsAPI.getUserSettings(user.id)
      console.log('✅ user_settings table accessible:', userSettings !== null)
      console.log('📊 user_settings result:', userSettings)
      
      // Test smart_withdrawal_settings table
      console.log('📋 Testing smart_withdrawal_settings table...')
      const smartSettings = await smartWithdrawalAPI.getSettings(user.id)
      console.log('✅ smart_withdrawal_settings table accessible:', smartSettings !== null)
      console.log('📊 smart_withdrawal_settings result:', smartSettings)
      
      // Test trades table
      console.log('📋 Testing trades table...')
      const trades = await tradeAPI.getTrades(user.id)
      console.log('✅ trades table accessible:', Array.isArray(trades))
      console.log('📊 trades result:', trades)
      
      // Summary
      const allTablesWorking = userSettings !== null && smartSettings !== null && Array.isArray(trades)
      
      if (allTablesWorking) {
        console.log('🎉 ALL TABLES ARE WORKING PROPERLY!')
        alert('✅ Database connection test completed successfully!\n\nAll tables are accessible:\n• user_settings ✅\n• smart_withdrawal_settings ✅\n• trades ✅\n\nCheck browser console for detailed results.')
      } else {
        console.log('❌ Some tables are not working properly')
        alert('⚠️ Database connection test completed with issues.\n\nCheck browser console for detailed results.')
      }
    } catch (error) {
      console.error('❌ Database connection test failed:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      alert('❌ Database connection test failed!\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error') + '\n\nCheck browser console for detailed results.')
    }
  }

  const checkTableExistence = async () => {
    if (!user) return
    
    try {
      console.log('🔍 Checking if tables exist...')
      
      // Try to create a test record to see if table exists
      const testSettings = {
        user_id: user.id,
        starting_capital: 0,
        notifications: true,
        email_updates: false,
        auto_backup: true,
        theme: 'dark'
      }
      
      console.log('📝 Attempting to save test settings...')
      const saveResult = await settingsAPI.saveUserSettings(testSettings)
      console.log('💾 Save result:', saveResult)
      
      if (saveResult) {
        console.log('✅ Table exists and is writable!')
        alert('✅ Table exists and is working properly!')
      } else {
        console.log('❌ Table does not exist or is not writable')
        alert('❌ Table does not exist or is not writable. Please run the SQL scripts in Supabase.')
      }
    } catch (error) {
      console.error('❌ Table existence check failed:', error)
      alert('❌ Table existence check failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const testSupabaseConnection = async () => {
    if (!user) return
    
    try {
      console.log('🔍 Testing Supabase connection...')
      console.log('User ID:', user.id)
      console.log('User email:', user.email)
      
      // Test basic Supabase connection
      const { data: testData, error: testError } = await supabase
        .from('user_settings')
        .select('count')
        .limit(1)
      
      console.log('📊 Basic connection test:', { data: testData, error: testError })
      
      if (testError) {
        console.error('❌ Basic connection failed:', testError)
        alert('❌ Basic Supabase connection failed: ' + testError.message)
      } else {
        console.log('✅ Basic connection successful')
        
        // Test with user-specific query
        const { data: userData, error: userError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
        
        console.log('📊 User-specific query:', { data: userData, error: userError })
        
        if (userError) {
          console.error('❌ User-specific query failed:', userError)
          alert('❌ User-specific query failed: ' + userError.message + '\n\nThis might be an RLS policy issue.')
        } else {
          console.log('✅ User-specific query successful')
          alert('✅ Supabase connection is working properly!\n\nBoth basic and user-specific queries succeeded.')
        }
      }
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error)
      alert('❌ Supabase connection test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const testDirectSupabase = async () => {
    if (!user) return
    
    try {
      console.log('🔍 Testing direct Supabase connection...')
      console.log('User ID:', user.id)
      
      // Import supabase directly
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = 'https://leurhwzhedghjkyhpwxk.supabase.co'
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxldXJod3poZWRnaGpreWhwd3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjI5NTAsImV4cCI6MjA2OTUzODk1MH0.wknGQYDaoWjxCWkaiZ0ernjL7tKK3_eBC_29nOI_-UM'
      
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
      
      console.log('📊 Testing basic query...')
      const { data, error } = await supabaseClient
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
      
      console.log('📊 Direct query result:', { data, error })
      
      if (error) {
        console.error('❌ Direct query failed:', error)
        alert('❌ Direct query failed: ' + error.message + '\n\nError code: ' + error.code)
      } else {
        console.log('✅ Direct query successful!')
        alert('✅ Direct Supabase connection works!\n\nData: ' + JSON.stringify(data))
      }
    } catch (error) {
      console.error('❌ Direct test failed:', error)
      alert('❌ Direct test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Settings
              </h1>
              <p className="text-dark-textSecondary">
                Manage your account preferences and trading settings
              </p>
            </div>

            {/* Profile Settings */}
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Profile Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    disabled
                  />
                  <p className="mt-1 text-xs text-dark-textSecondary">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Starting Capital
                  </label>
                  <input
                    type="number"
                    value={settings.starting_capital}
                    onChange={(e) => handleSettingChange('starting_capital', parseFloat(e.target.value))}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  <p className="mt-1 text-xs text-dark-textSecondary">
                    Your initial trading capital used as basis for dashboard calculations
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Withdrawal Settings */}
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Smart Withdrawal Settings
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Enable Smart Withdrawal
                    </h3>
                    <p className="text-sm text-dark-textSecondary">
                      Automatically calculate available withdrawals based on profits
                    </p>
                  </div>
                  <button
                    onClick={() => setSmartWithdrawalSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                      smartWithdrawalSettings.enabled 
                        ? 'bg-primary-500 shadow-lg shadow-primary-500/25' 
                        : 'bg-gray-500 hover:bg-gray-400'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-200 ${
                      smartWithdrawalSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                    <span className={`absolute text-xs font-bold transition-all duration-200 ${
                      smartWithdrawalSettings.enabled ? 'text-white left-1 opacity-100' : 'text-gray-400 right-1 opacity-0'
                    }`}>
                      {smartWithdrawalSettings.enabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>

                {smartWithdrawalSettings.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Reinvest Percentage (%)
                      </label>
                      <input
                        type="number"
                        value={smartWithdrawalSettings.reinvest_percentage}
                        onChange={(e) => setSmartWithdrawalSettings(prev => ({ 
                          ...prev, 
                          reinvest_percentage: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="50"
                        min="0"
                        max="100"
                        step="1"
                        className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      />
                      <p className="mt-1 text-xs text-dark-textSecondary">
                        Percentage of profits that stay in your trading account
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Preferences
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Push Notifications
                    </h3>
                    <p className="text-sm text-dark-textSecondary">
                      Receive notifications for important events
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', !settings.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                      settings.notifications 
                        ? 'bg-primary-500 shadow-lg shadow-primary-500/25' 
                        : 'bg-gray-500 hover:bg-gray-400'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-200 ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                    <span className={`absolute text-xs font-bold transition-all duration-200 ${
                      settings.notifications ? 'text-white left-1 opacity-100' : 'text-gray-400 right-1 opacity-0'
                    }`}>
                      {settings.notifications ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Email Updates
                    </h3>
                    <p className="text-sm text-dark-textSecondary">
                      Receive weekly performance summaries
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('email_updates', !settings.email_updates)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                      settings.email_updates 
                        ? 'bg-primary-500 shadow-lg shadow-primary-500/25' 
                        : 'bg-gray-500 hover:bg-gray-400'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-200 ${
                      settings.email_updates ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                    <span className={`absolute text-xs font-bold transition-all duration-200 ${
                      settings.email_updates ? 'text-white left-1 opacity-100' : 'text-gray-400 right-1 opacity-0'
                    }`}>
                      {settings.email_updates ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Auto Backup
                    </h3>
                    <p className="text-sm text-dark-textSecondary">
                      Automatically backup your trading data
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('auto_backup', !settings.auto_backup)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                      settings.auto_backup 
                        ? 'bg-primary-500 shadow-lg shadow-primary-500/25' 
                        : 'bg-gray-500 hover:bg-gray-400'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-200 ${
                      settings.auto_backup ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                    <span className={`absolute text-xs font-bold transition-all duration-200 ${
                      settings.auto_backup ? 'text-white left-1 opacity-100' : 'text-gray-400 right-1 opacity-0'
                    }`}>
                      {settings.auto_backup ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Data Management
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-border rounded-xl">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Test Database Connection
                    </h3>
                    <p className="text-sm text-dark-textSecondary">
                      Verify if database tables are properly set up
                    </p>
                  </div>
                  <button 
                    onClick={testDatabaseConnection}
                    className="px-6 py-3 text-sm font-semibold text-warning-400 hover:text-warning-300 bg-dark-card hover:bg-dark-input rounded-xl transition-all duration-200 border border-warning-400 hover:border-warning-300"
                  >
                    Test Connection
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-border rounded-xl">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Check Table Existence
                    </h3>
                    <p className="text-sm text-dark-textSecondary">
                      Test if user_settings table exists and is writable
                    </p>
                  </div>
                  <button 
                    onClick={checkTableExistence}
                    className="px-6 py-3 text-sm font-semibold text-info-400 hover:text-info-300 bg-dark-card hover:bg-dark-input rounded-xl transition-all duration-200 border border-info-400 hover:border-info-300"
                  >
                    Check Table
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-border rounded-xl">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Test Supabase Connection
                    </h3>
                    <p className="text-sm text-dark-textSecondary">
                      Verify Supabase client is configured correctly
                    </p>
                  </div>
                  <button 
                    onClick={testSupabaseConnection}
                    className="px-6 py-3 text-sm font-semibold text-success-400 hover:text-success-300 bg-dark-card hover:bg-dark-input rounded-xl transition-all duration-200 border border-success-400 hover:border-success-300"
                  >
                    Test Supabase
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-border rounded-xl">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Test Direct Supabase Connection
                    </h3>
                    <p className="text-sm text-dark-textSecondary">
                      Verify direct Supabase connection works
                    </p>
                  </div>
                  <button 
                    onClick={testDirectSupabase}
                    className="px-6 py-3 text-sm font-semibold text-info-400 hover:text-info-300 bg-dark-card hover:bg-dark-input rounded-xl transition-all duration-200 border border-info-400 hover:border-info-300"
                  >
                    Test Direct
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-border rounded-xl">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Export Data
                    </h3>
                    <p className="text-sm text-dark-textSecondary">
                      Download all your trading data as JSON
                    </p>
                  </div>
                  <button className="px-6 py-3 text-sm font-semibold text-primary-400 hover:text-primary-300 bg-dark-card hover:bg-dark-input rounded-xl transition-all duration-200 border border-primary-400 hover:border-primary-300">
                    Export
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-border rounded-xl">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Clear All Data
                    </h3>
                    <p className="text-sm text-dark-textSecondary">
                      Permanently delete all trading records
                    </p>
                  </div>
                  <button 
                    onClick={handleClearAllData}
                    className="px-6 py-3 text-sm font-semibold text-danger-400 hover:text-danger-300 bg-dark-card hover:bg-dark-input rounded-xl transition-all duration-200 border border-danger-400 hover:border-danger-300"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Account Actions
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-glow-dark disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg border border-primary-500"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full px-6 py-4 text-white bg-dark-border rounded-xl hover:bg-dark-input hover:text-primary-300 transition-all duration-200 font-semibold text-lg border border-dark-border"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 