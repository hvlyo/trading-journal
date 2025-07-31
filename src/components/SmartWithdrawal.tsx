'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { smartWithdrawalAPI, SmartWithdrawalSettings, WithdrawalTransaction } from '@/lib/supabase'

interface SmartWithdrawalProps {
  totalProfit: number
  onWithdrawalChange?: () => void
}

export default function SmartWithdrawal({ totalProfit, onWithdrawalChange }: SmartWithdrawalProps) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<SmartWithdrawalSettings | null>(null)
  const [transactions, setTransactions] = useState<WithdrawalTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showTransactions, setShowTransactions] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [databaseError, setDatabaseError] = useState<string | null>(null)

  // Load settings and transactions on mount
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    setDatabaseError(null)
    try {
      const [settingsData, transactionsData] = await Promise.all([
        smartWithdrawalAPI.getSettings(user.id),
        smartWithdrawalAPI.getTransactions(user.id)
      ])
      
      // If no settings exist, create default settings
      if (!settingsData) {
        const defaultSettings: SmartWithdrawalSettings = {
          user_id: user.id,
          enabled: false,
          reinvest_percentage: 50
        }
        setSettings(defaultSettings)
      } else {
        setSettings(settingsData)
      }
      
      setTransactions(transactionsData || [])
    } catch (error) {
      console.error('Error loading smart withdrawal data:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      // Check if it's a database setup error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('42P01') || errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        setDatabaseError('Database tables not set up. Please run the setup SQL in Supabase.')
      } else {
        setDatabaseError('Unable to load smart withdrawal data. Please try again.')
      }
      
      // Set default settings if none exist
      if (!settings) {
        setSettings({
          user_id: user.id,
          enabled: false,
          reinvest_percentage: 50
        })
      }
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate available withdrawals
  const calculateAvailableWithdrawals = () => {
    if (!settings || !settings.enabled) return 0
    
    const totalWithdrawn = transactions
      .filter(t => t.action === 'WITHDRAW')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalReverted = transactions
      .filter(t => t.action === 'REVERT')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const netWithdrawn = totalWithdrawn - totalReverted
    const availableForWithdrawal = Math.max(0, totalProfit * (1 - settings.reinvest_percentage / 100))
    
    return Math.max(0, availableForWithdrawal - netWithdrawn)
  }

  const handleWithdraw = async () => {
    if (!user || !settings || !withdrawAmount) return
    
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid withdrawal amount')
      return
    }
    
    const availableWithdrawals = calculateAvailableWithdrawals()
    if (amount > availableWithdrawals) {
      alert(`Withdrawal amount exceeds available withdrawals (${availableWithdrawals.toFixed(2)} USD)`)
      return
    }
    
    setProcessing(true)
    try {
      const transaction: WithdrawalTransaction = {
        user_id: user.id,
        amount,
        action: 'WITHDRAW',
        timestamp: new Date().toISOString(),
        description: `Withdrawal of ${amount.toFixed(2)} USD`
      }
      
      const success = await smartWithdrawalAPI.addTransaction(transaction)
      if (success) {
        setWithdrawAmount('')
        setShowWithdrawModal(false)
        await loadData()
        onWithdrawalChange?.()
        alert('Withdrawal processed successfully!')
      } else {
        alert('Failed to process withdrawal. Please try again.')
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      alert('An error occurred while processing the withdrawal.')
    } finally {
      setProcessing(false)
    }
  }

  const handleRevert = async (transactionId: string, amount: number) => {
    if (!user) return
    
    if (!confirm(`Are you sure you want to revert this withdrawal of ${amount.toFixed(2)} USD?`)) {
      return
    }
    
    setProcessing(true)
    try {
      const success = await smartWithdrawalAPI.revertTransaction(transactionId)
      if (success) {
        await loadData()
        onWithdrawalChange?.()
        alert('Withdrawal reverted successfully!')
      } else {
        alert('Failed to revert withdrawal. Please try again.')
      }
    } catch (error) {
      console.error('Error reverting withdrawal:', error)
      alert('An error occurred while reverting the withdrawal.')
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-dark-border rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-dark-border rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-dark-border rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  // Show database setup error
  if (databaseError) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-warning-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Setup Required</h3>
        </div>
        <p className="text-dark-textSecondary mb-4">{databaseError}</p>
        <div className="bg-dark-border rounded-xl p-4 mb-4">
          <h4 className="text-sm font-medium text-white mb-2">Quick Setup:</h4>
          <ol className="text-sm text-dark-textSecondary space-y-1">
            <li>1. Go to Supabase Dashboard → SQL Editor</li>
            <li>2. Run the setup SQL from smart_withdrawal_schema.sql</li>
            <li>3. Refresh this page</li>
          </ol>
        </div>
        <button
          onClick={loadData}
          className="w-full px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!settings) {
    return null
  }

  // If Smart Withdrawal is disabled, show enable option
  if (!settings.enabled) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6 hover:shadow-hover-dark transition-all duration-300">
                 <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-semibold text-white">Smart Withdrawal</h3>
                     <button
             onClick={async () => {
               if (settings) {
                 const updatedSettings = { ...settings, enabled: true }
                 const success = await smartWithdrawalAPI.saveSettings(updatedSettings)
                 if (success) {
                   setSettings(updatedSettings)
                 }
               }
             }}
             className="px-6 py-3 text-sm font-semibold text-primary-400 hover:text-primary-300 bg-dark-card hover:bg-dark-input rounded-xl transition-all duration-200 border border-primary-400 hover:border-primary-300"
           >
             Enable
           </button>
        </div>
        <p className="text-dark-textSecondary text-sm">
          Automatically calculate available withdrawals based on your profit and reinvestment rate.
        </p>
      </div>
    )
  }

  const availableWithdrawals = calculateAvailableWithdrawals()

  return (
    <>
      {/* Available Withdrawals Card */}
              <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6 hover:shadow-hover-dark transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Smart Withdrawal</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={async () => {
                if (settings) {
                  const updatedSettings = { ...settings, enabled: false }
                  const success = await smartWithdrawalAPI.saveSettings(updatedSettings)
                  if (success) {
                    setSettings(updatedSettings)
                  }
                }
              }}
              className="text-sm text-dark-textSecondary hover:text-white transition-colors"
            >
              Disable
            </button>
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              {showTransactions ? 'Hide' : 'Show'} History
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="text-4xl font-bold text-success-400 mb-2">
            {formatCurrency(availableWithdrawals)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-dark-border rounded-xl">
          <div>
            <h3 className="text-sm font-medium text-white mb-1">
              Available for Withdrawal
            </h3>
            <p className="text-sm text-dark-textSecondary">
              Based on {settings.reinvest_percentage}% reinvestment rate
            </p>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={availableWithdrawals <= 0}
            className="px-6 py-3 text-sm font-semibold text-success-400 hover:text-success-300 bg-dark-card hover:bg-dark-input rounded-xl transition-all duration-200 border border-success-400 hover:border-success-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-dark-textSecondary disabled:border-dark-border"
          >
            {availableWithdrawals > 0 ? 'Withdraw' : 'No funds'}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      {showTransactions && (
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6 mt-4">
          <h4 className="text-lg font-semibold text-white mb-4">Transaction History</h4>
          {transactions.length === 0 ? (
            <p className="text-dark-textSecondary text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-dark-border rounded-xl">
                  <div>
                    <p className="text-white font-medium">
                      {transaction.action === 'WITHDRAW' ? 'Withdrawal' : 'Reverted'}
                    </p>
                    <p className="text-dark-textSecondary text-sm">
                      {formatDate(transaction.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`font-semibold ${
                      transaction.action === 'WITHDRAW' ? 'text-danger-400' : 'text-success-400'
                    }`}>
                      {transaction.action === 'WITHDRAW' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </span>
                    {transaction.action === 'WITHDRAW' && (
                      <button
                        onClick={() => transaction.id && handleRevert(transaction.id, transaction.amount)}
                        disabled={processing}
                        className="text-xs text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50"
                      >
                        Revert
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Withdraw Funds</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Available for withdrawal: {formatCurrency(availableWithdrawals)}
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                max={availableWithdrawals}
                className="w-full px-4 py-3 border border-dark-border rounded-xl bg-dark-input text-white placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 text-white bg-dark-border rounded-xl hover:bg-dark-input transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={processing || !withdrawAmount}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-xl hover:from-success-600 hover:to-success-700 transition-all duration-200 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 