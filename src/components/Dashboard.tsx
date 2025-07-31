'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CapitalChart from './CapitalChart'
import Sidebar from './Sidebar'
import Header from './Header'
import MetricCard from './MetricCard'
import SmartWithdrawal from './SmartWithdrawal'
import { tradeAPI, settingsAPI, Trade } from '@/lib/supabase'

// Local trade interface for dashboard display
interface DashboardTrade extends Trade {
  status: 'OPEN' | 'CLOSED'
}

// Trading data interface
interface TradingData {
  totalCapital: number
  netPL: number
  netPLPercentage: number
  capitalHistory: Array<{ date: string; capital: number }>
  recentTrades: DashboardTrade[]
}

// Empty initial data for new users
const emptyTradingData: TradingData = {
  totalCapital: 0,
  netPL: 0,
  netPLPercentage: 0,
  capitalHistory: [
    { date: new Date().toISOString().split('T')[0], capital: 0 }
  ],
  recentTrades: []
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'profile'>('overview')
  const [isUpdatingCapital, setIsUpdatingCapital] = useState(false)
  const [isClearingLogs, setIsClearingLogs] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Start with empty data for new users
  const [tradingData, setTradingData] = useState<TradingData>(emptyTradingData)
  
  // Local state for capital input editing
  const [editingCapital, setEditingCapital] = useState(tradingData.totalCapital)

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        console.log('🔍 Fetching dashboard data for user:', user.id)
        
        // Fetch user settings (starting capital)
        const userSettings = await settingsAPI.getUserSettings(user.id)
        const startingCapital = userSettings?.starting_capital || 0
        
        // Fetch recent trades
        const trades = await tradeAPI.getTrades(user.id)
        const recentTrades: DashboardTrade[] = trades.slice(0, 10).map(trade => ({
          ...trade,
          status: trade.closeTime ? 'CLOSED' : 'OPEN'
        }))
        
        // Calculate net PnL
        const netPL = recentTrades.reduce((sum, trade) => sum + trade.pnl, 0)
        const totalCapital = startingCapital + netPL
        const netPLPercentage = startingCapital > 0 ? (netPL / startingCapital) * 100 : 0
        
        // Create capital history with more data points for better chart visualization
        const capitalHistory = []
        
        // If no starting capital is set, create a default starting point
        const effectiveStartingCapital = startingCapital > 0 ? startingCapital : 1000 // Default $1000 if not set
        
        // Add starting capital point (30 days ago)
        capitalHistory.push({
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          capital: effectiveStartingCapital
        })
        
        // If we have trades, add intermediate points based on trade dates
        if (recentTrades.length > 0) {
          const sortedTrades = [...recentTrades].sort((a, b) => new Date(a.openTime).getTime() - new Date(b.openTime).getTime())
          let runningCapital = effectiveStartingCapital
          
          sortedTrades.forEach((trade, index) => {
            runningCapital += trade.pnl
            capitalHistory.push({
              date: new Date(trade.openTime).toISOString().split('T')[0],
              capital: runningCapital
            })
          })
        } else {
          // If no trades, create some sample data points to show the chart
          const daysAgo = [25, 20, 15, 10, 5, 0]
          daysAgo.forEach((days, index) => {
            const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            // Add some small random variation to show the chart
            const variation = (Math.random() - 0.5) * 50 // ±$25 variation
            capitalHistory.push({
              date,
              capital: effectiveStartingCapital + variation
            })
          })
        }
        
        // Always add current total capital point
        capitalHistory.push({
          date: new Date().toISOString().split('T')[0],
          capital: totalCapital
        })
        
        const newTradingData: TradingData = {
          totalCapital,
          netPL,
          netPLPercentage,
          capitalHistory,
          recentTrades
        }
        
        setTradingData(newTradingData)
        setEditingCapital(startingCapital)
        console.log('✅ Dashboard data loaded successfully')
        console.log('📊 Capital history data:', capitalHistory)
        console.log('💰 Starting capital:', startingCapital)
        console.log('💵 Total capital:', totalCapital)
        console.log('📈 Net PnL:', netPL)
        console.log('🎯 Number of trades:', recentTrades.length)
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])
  
  // Calculate derived values from tradingData
  const calculatedValues = {
    totalCapital: tradingData.totalCapital,
    totalTrades: tradingData.recentTrades.length,
    netPL: tradingData.netPL,
    netPLPercentage: tradingData.netPLPercentage,
    dataPoints: tradingData.capitalHistory.length
  }

  // Update editing capital when trading data changes
  useEffect(() => {
    setEditingCapital(tradingData.totalCapital)
  }, [tradingData.totalCapital])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleUpdateCapital = async (newCapital: number) => {
    if (!user) return
    
    setIsUpdatingCapital(true)
    try {
      // Save to database
      const success = await settingsAPI.saveUserSettings({
        user_id: user.id,
        starting_capital: newCapital,
        notifications: true,
        email_updates: false,
        auto_backup: true,
        theme: 'dark'
      })
      
      if (success) {
        // Update the trading data with new capital
        const updatedData = { 
          ...tradingData, 
          totalCapital: newCapital,
          capitalHistory: [
            { date: new Date().toISOString().split('T')[0], capital: newCapital }
          ]
        }
        setTradingData(updatedData)
        alert('Total capital updated successfully!')
      } else {
        alert('Failed to update capital. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error updating capital:', error)
      alert('Failed to update capital. Please try again.')
    } finally {
      setIsUpdatingCapital(false)
    }
  }

  const handleClearAllLogs = async () => {
    if (!user) return
    
    if (!confirm('Are you sure you want to clear all your trading logs? This action cannot be undone.')) {
      return
    }
    
    setIsClearingLogs(true)
    try {
      // Get all trades for the user
      const trades = await tradeAPI.getTrades(user.id)
      
      // Delete each trade
      for (const trade of trades) {
        if (trade.id) {
          await tradeAPI.deleteTrade(trade.id)
        }
      }
      
      // Clear localStorage
      localStorage.removeItem('tradeFormDraft')
      localStorage.removeItem('tradeJournalFilters')
      localStorage.removeItem('tradeJournalSort')
      
      // Reset trading data but keep current capital
      const clearedData = {
        ...tradingData,
        recentTrades: [],
        capitalHistory: [
          { date: new Date().toISOString().split('T')[0], capital: tradingData.totalCapital }
        ],
        netPL: 0,
        netPLPercentage: 0
      }
      setTradingData(clearedData)
      
      alert('All trading logs have been cleared successfully! Your dashboard has been reset.')
    } catch (error) {
      console.error('❌ Error clearing logs:', error)
      alert('Failed to clear logs. Please try again.')
    } finally {
      setIsClearingLogs(false)
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

  const getPLColor = (pl: number) => {
    if (pl > 0) return 'text-green-400'
    if (pl < 0) return 'text-red-400'
    return 'text-white'
  }

  const getTypeColor = (type: string) => {
    return type === 'LONG' 
      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
      : 'bg-red-500/20 text-red-400 border border-red-500/30'
  }

  const getStatusColor = (status: string) => {
    return status === 'OPEN' 
      ? 'text-warning-500' 
      : 'text-dark-textSecondary'
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-dark-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-4 text-dark-textSecondary">Loading dashboard...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Capital"
                value={formatCurrency(calculatedValues.totalCapital)}
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
                gradient="from-success-500 to-success-600"
              />
              <MetricCard
                title="Net P/L"
                value={formatCurrency(calculatedValues.netPL)}
                change={calculatedValues.netPLPercentage.toFixed(2) + '%'}
                changeType={calculatedValues.netPL >= 0 ? 'positive' : 'negative'}
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                gradient={calculatedValues.netPL >= 0 ? "from-success-500 to-success-600" : "from-danger-500 to-danger-600"}
              />
              <MetricCard
                title="Total Trades"
                value={calculatedValues.totalTrades.toString()}
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                gradient="from-primary-500 to-primary-600"
              />
              <MetricCard
                title="Data Points"
                value={calculatedValues.dataPoints.toString()}
                icon={
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                gradient="from-warning-500 to-warning-600"
              />
            </div>

            {/* Capital Chart */}
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6 hover:shadow-hover-dark transition-all duration-300">
              <h2 className="text-xl font-bold text-white mb-4">Capital Growth</h2>
              <CapitalChart data={tradingData.capitalHistory} width={800} height={400} />
            </div>

            {/* Smart Withdrawal */}
            <SmartWithdrawal 
              totalProfit={calculatedValues.netPL} 
              onWithdrawalChange={() => {
                // Refresh dashboard data if needed
                console.log('Withdrawal changed, refreshing data...')
              }}
            />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/new-trade" className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6 hover:shadow-hover-dark transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow-dark">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">Add New Trade</h3>
                    <p className="text-dark-textSecondary">Log your latest trading activity</p>
                  </div>
                </div>
              </Link>

              <Link href="/journal" className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6 hover:shadow-hover-dark transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow-dark">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-success-400 transition-colors">View Journal</h3>
                    <p className="text-dark-textSecondary">Review your trading history</p>
                  </div>
                </div>
              </Link>

              <Link href="/analytics" className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6 hover:shadow-hover-dark transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow-dark">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-warning-400 transition-colors">Analytics</h3>
                    <p className="text-dark-textSecondary">Analyze your performance</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Recent Trades */}
            {tradingData.recentTrades.length > 0 && (
              <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6 hover:shadow-hover-dark transition-all duration-300">
                <h2 className="text-xl font-bold text-white mb-4">Recent Trades</h2>
                <div className="space-y-4">
                  {tradingData.recentTrades.slice(0, 5).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 bg-dark-border rounded-xl hover:bg-dark-input transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(trade.type)}`}>
                          {trade.type}
                        </div>
                        <div>
                          <p className="text-white font-medium">{trade.asset}</p>
                          <p className="text-dark-textSecondary text-sm">{formatDate(trade.openTime)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getPLColor(trade.pnl)}`}>
                          {formatCurrency(trade.pnl)}
                        </p>
                        <p className={`text-sm ${getStatusColor(trade.status)}`}>
                          {trade.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 