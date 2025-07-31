'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// Trade interface
interface Trade {
  id: number
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
  status: 'OPEN' | 'CLOSED'
}

// Trading data interface
interface TradingData {
  totalCapital: number
  netPL: number
  netPLPercentage: number
  dailyPL: number
  weeklyPL: number
  monthlyPL: number
  winRate: number
  totalTrades: number
  openPositions: number
  capitalHistory: Array<{ date: string; capital: number }>
  recentTrades: Trade[]
}

// Empty initial data for new users
const emptyTradingData: TradingData = {
  totalCapital: 0,
  netPL: 0,
  netPLPercentage: 0,
  dailyPL: 0,
  weeklyPL: 0,
  monthlyPL: 0,
  winRate: 0,
  totalTrades: 0,
  openPositions: 0,
  capitalHistory: [
    { date: new Date().toISOString().split('T')[0], capital: 0 }
  ],
  recentTrades: []
}

export default function TradingDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'analytics'>('overview')
  
  // Start with empty data for new users
  const [tradingData, setTradingData] = useState<TradingData>(emptyTradingData)
  
  // Calculate derived values
  const calculatedValues = {
    totalCapital: tradingData.totalCapital,
    totalTrades: tradingData.recentTrades.length,
    netPL: tradingData.recentTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0),
    netPLPercentage: tradingData.totalCapital > 0 
      ? (tradingData.recentTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / tradingData.totalCapital) * 100 
      : 0,
    dataPoints: tradingData.capitalHistory.length,
    openPositions: tradingData.recentTrades.filter(trade => trade.status === 'OPEN').length,
    winRate: tradingData.recentTrades.length > 0 
      ? (tradingData.recentTrades.filter(trade => trade.pnl > 0).length / tradingData.recentTrades.length) * 100 
      : 0
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
    if (pl > 0) return 'text-green-500'
    if (pl < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  const getTypeColor = (type: string) => {
    return type === 'LONG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getStatusColor = (status: string) => {
    return status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Trading Dashboard</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {user?.email}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'trades', name: 'Trades' },
              { id: 'analytics', name: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Capital</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(calculatedValues.totalCapital)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Net P/L</p>
                    <p className={`text-2xl font-semibold ${getPLColor(calculatedValues.netPL)}`}>
                      {formatCurrency(calculatedValues.netPL)}
                    </p>
                    <p className={`text-sm ${getPLColor(calculatedValues.netPL)}`}>
                      {calculatedValues.netPLPercentage > 0 ? '+' : ''}{calculatedValues.netPLPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Win Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{calculatedValues.winRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">{calculatedValues.totalTrades} trades</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Open Positions</p>
                    <p className="text-2xl font-semibold text-gray-900">{calculatedValues.openPositions}</p>
                    <p className="text-sm text-gray-500">Active trades</p>
                  </div>
                </div>
              </div>
            </div>

            {/* P/L Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily P/L</h3>
                <p className={`text-3xl font-bold ${getPLColor(tradingData.dailyPL)}`}>
                  {formatCurrency(tradingData.dailyPL)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly P/L</h3>
                <p className={`text-3xl font-bold ${getPLColor(tradingData.weeklyPL)}`}>
                  {formatCurrency(tradingData.weeklyPL)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly P/L</h3>
                <p className={`text-3xl font-bold ${getPLColor(tradingData.monthlyPL)}`}>
                  {formatCurrency(tradingData.monthlyPL)}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {tradingData.recentTrades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${trade.type === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{trade.asset}</p>
                          <p className="text-sm text-gray-500">{trade.type} {trade.quantity} @ {trade.leverage}x</p>
                          <p className="text-xs text-gray-400">{formatDate(trade.openTime)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(trade.openPrice)}</p>
                        <p className={`text-sm ${getPLColor(trade.pnl)}`}>
                          {formatCurrency(trade.pnl)} ({trade.pnlType})
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trade.status)}`}>
                          {trade.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Trades</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leverage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PnL (USDT)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tradingData.recentTrades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trade.asset}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(trade.type)}`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.leverage}x</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trade.openPrice)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trade.closePrice ? formatCurrency(trade.closePrice) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={getPLColor(trade.pnl)}>
                          {formatCurrency(trade.pnl)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">({trade.pnlType})</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(trade.openTime)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trade.closeTime ? formatDate(trade.closeTime) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Trades</span>
                    <span className="text-sm font-medium text-gray-900">{tradingData.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Win Rate</span>
                    <span className="text-sm font-medium text-gray-900">{tradingData.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Open Positions</span>
                    <span className="text-sm font-medium text-gray-900">{tradingData.openPositions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Capital</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(tradingData.totalCapital)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">P/L Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Daily P/L</span>
                    <span className={`text-sm font-medium ${getPLColor(tradingData.dailyPL)}`}>
                      {formatCurrency(tradingData.dailyPL)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Weekly P/L</span>
                    <span className={`text-sm font-medium ${getPLColor(tradingData.weeklyPL)}`}>
                      {formatCurrency(tradingData.weeklyPL)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Monthly P/L</span>
                    <span className={`text-sm font-medium ${getPLColor(tradingData.monthlyPL)}`}>
                      {formatCurrency(tradingData.monthlyPL)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total P/L</span>
                    <span className={`text-sm font-medium ${getPLColor(tradingData.netPL)}`}>
                      {formatCurrency(tradingData.netPL)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 