'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import MetricCard from '@/components/MetricCard'
import { tradeAPI, Trade } from '@/lib/supabase'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [timeframe, setTimeframe] = useState('1M')
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
    }
  }, [user, router])

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return
      try {
        setLoading(true)
        console.log('🔍 Fetching trades for user:', user.id)
        const fetchedTrades = await tradeAPI.getTrades(user.id)
        console.log('📊 Fetched trades:', fetchedTrades?.length || 0)
        setTrades(fetchedTrades || [])
      } catch (error) {
        console.error('❌ Error fetching trades for analytics:', error)
        setTrades([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Filter trades based on timeframe
  const filteredTrades = useMemo(() => {
    if (!trades.length) return []
    
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeframe) {
      case '1W':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case 'ALL':
        return trades
      default:
        cutoffDate.setMonth(now.getMonth() - 1)
    }
    
    return trades.filter((trade: Trade) => new Date(trade.openTime) >= cutoffDate)
  }, [trades, timeframe])

  // Calculate analytics
  const analytics = useMemo(() => {
    console.log('🔍 Calculating analytics for', filteredTrades.length, 'trades')
    if (!filteredTrades.length) {
      console.log('📊 No trades to analyze')
      return {
        totalReturn: 0,
        totalPnL: 0,
        winRate: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        averageWin: 0,
        averageLoss: 0,
        bestAsset: null,
        worstAsset: null,
        assetDistribution: {},
        strategyPerformance: {},
        dailyTrades: 0,
        weeklyTrades: 0,
        monthlyTrades: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        volatility: 0
      }
    }

    const totalPnL = filteredTrades.reduce((sum: number, trade: Trade) => sum + trade.pnl, 0)
    const winningTrades = filteredTrades.filter((trade: Trade) => trade.pnl > 0)
    const losingTrades = filteredTrades.filter((trade: Trade) => trade.pnl < 0)
    const winRate = (winningTrades.length / filteredTrades.length) * 100
    const averageWin = winningTrades.length > 0 ? winningTrades.reduce((sum: number, trade: Trade) => sum + trade.pnl, 0) / winningTrades.length : 0
    const averageLoss = losingTrades.length > 0 ? losingTrades.reduce((sum: number, trade: Trade) => sum + trade.pnl, 0) / losingTrades.length : 0

    // Asset analysis
    const assetPnL = filteredTrades.reduce((acc: Record<string, number>, trade: Trade) => {
      if (!acc[trade.asset]) acc[trade.asset] = 0
      acc[trade.asset] += trade.pnl
      return acc
    }, {} as Record<string, number>)

    const bestAsset = Object.entries(assetPnL).reduce((best: { asset: string; pnl: number }, [asset, pnl]) => 
      pnl > best.pnl ? { asset, pnl } : best, { asset: '', pnl: -Infinity }
    )

    const worstAsset = Object.entries(assetPnL).reduce((worst: { asset: string; pnl: number }, [asset, pnl]) => 
      pnl < worst.pnl ? { asset, pnl } : worst, { asset: '', pnl: Infinity }
    )

    // Asset distribution
    const assetDistribution = filteredTrades.reduce((acc: Record<string, number>, trade: Trade) => {
      acc[trade.asset] = (acc[trade.asset] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Strategy performance (default to 'Swing' since strategy field is not in Trade interface)
    const strategyPerformance = filteredTrades.reduce((acc: Record<string, { totalPnL: number, count: number }>, trade: Trade) => {
      const strategy = 'Swing' // Default strategy since it's not stored in database
      if (!acc[strategy]) acc[strategy] = { totalPnL: 0, count: 0 }
      acc[strategy].totalPnL += trade.pnl
      acc[strategy].count += 1
      return acc
    }, {} as Record<string, { totalPnL: number, count: number }>)

    // Trading frequency
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const dailyTrades = filteredTrades.filter((trade: Trade) => new Date(trade.openTime) >= oneDayAgo).length
    const weeklyTrades = filteredTrades.filter((trade: Trade) => new Date(trade.openTime) >= oneWeekAgo).length
    const monthlyTrades = filteredTrades.filter((trade: Trade) => new Date(trade.openTime) >= oneMonthAgo).length

    // Risk metrics (simplified calculations)
    const returns = filteredTrades.map((trade: Trade) => trade.pnl)
    const meanReturn = returns.reduce((sum: number, ret: number) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum: number, ret: number) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance)
    const sharpeRatio = volatility > 0 ? meanReturn / volatility : 0

    // Max drawdown (simplified)
    let maxDrawdown = 0
    let peak = 0
    let runningTotal = 0
    filteredTrades.forEach((trade: Trade) => {
      runningTotal += trade.pnl
      if (runningTotal > peak) peak = runningTotal
      if (peak > 0) {
        const drawdown = (peak - runningTotal) / peak * 100
        if (drawdown > maxDrawdown) maxDrawdown = drawdown
      }
    })

    return {
      totalReturn: totalPnL,
      totalPnL,
      winRate,
      totalTrades: filteredTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageWin,
      averageLoss,
      bestAsset: bestAsset.pnl > -Infinity ? bestAsset : null,
      worstAsset: worstAsset.pnl < Infinity ? worstAsset : null,
      assetDistribution,
      strategyPerformance,
      dailyTrades,
      weeklyTrades,
      monthlyTrades,
      maxDrawdown,
      sharpeRatio,
      volatility
    }
  }, [filteredTrades])

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
                  <p className="mt-4 text-dark-textSecondary">Loading analytics...</p>
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
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Analytics
                </h1>
                <p className="text-dark-textSecondary">
                  Deep insights into your trading performance
                </p>
              </div>
              
              {/* Timeframe Selector */}
              <div className="flex items-center space-x-2 bg-dark-card rounded-xl p-1 shadow-card-dark">
                {['1W', '1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      timeframe === period
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-dark-textSecondary hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Return"
                value={formatCurrency(analytics.totalReturn)}
                change={`${analytics.totalReturn >= 0 ? '+' : ''}${formatCurrency(analytics.totalReturn)}`}
                changeType={analytics.totalReturn >= 0 ? 'positive' : 'negative'}
                icon={<span className="text-white text-xl">📈</span>}
                gradient="from-primary-500 to-primary-600"
              />
              <MetricCard
                title="Win Rate"
                value={`${analytics.winRate.toFixed(1)}%`}
                change={`${analytics.winningTrades}/${analytics.totalTrades} trades`}
                changeType="neutral"
                icon={<span className="text-white text-xl">🎯</span>}
                gradient="from-success-500 to-success-600"
              />
              <MetricCard
                title="Average Win"
                value={formatCurrency(analytics.averageWin)}
                icon={<span className="text-white text-xl">💰</span>}
                gradient="from-warning-500 to-warning-600"
              />
              <MetricCard
                title="Average Loss"
                value={formatCurrency(analytics.averageLoss)}
                icon={<span className="text-white text-xl">📉</span>}
                gradient="from-danger-500 to-danger-600"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Performance Over Time
                </h3>
                {analytics.totalTrades > 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-500 mb-2">
                        {formatCurrency(analytics.totalReturn)}
                      </div>
                      <div className={`text-sm ${analytics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {analytics.totalReturn >= 0 ? '+' : ''}{formatCurrency(analytics.totalReturn)} total PnL
                      </div>
                      <div className="text-xs text-dark-textSecondary mt-2">
                        {analytics.totalTrades} trades in {timeframe}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-dark-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-white">No data available</h3>
                      <p className="mt-1 text-sm text-dark-textSecondary">Start trading to see performance charts</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Asset Distribution */}
              <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Asset Distribution
                </h3>
                {Object.keys(analytics.assetDistribution).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.assetDistribution)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([asset, count]) => (
                        <div key={asset} className="flex items-center justify-between">
                          <span className="text-sm text-white">{asset}</span>
                          <span className="text-sm text-dark-textSecondary">{count} trades</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-dark-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-white">No data available</h3>
                      <p className="mt-1 text-sm text-dark-textSecondary">Add trades to see asset distribution</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trading Frequency */}
              <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Trading Frequency
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-textSecondary">Daily</span>
                    <span className="text-sm font-medium text-white">{analytics.dailyTrades} trades</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-textSecondary">Weekly</span>
                    <span className="text-sm font-medium text-white">{analytics.weeklyTrades} trades</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-textSecondary">Monthly</span>
                    <span className="text-sm font-medium text-white">{analytics.monthlyTrades} trades</span>
                  </div>
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Risk Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-textSecondary">Sharpe Ratio</span>
                    <span className="text-sm font-medium text-white">{analytics.sharpeRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-textSecondary">Max Drawdown</span>
                    <span className="text-sm font-medium text-white">{analytics.maxDrawdown.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-textSecondary">Volatility</span>
                    <span className="text-sm font-medium text-white">{formatCurrency(analytics.volatility)}</span>
                  </div>
                </div>
              </div>

              {/* Strategy Performance */}
              <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Strategy Performance
                </h3>
                <div className="space-y-4">
                  {Object.entries(analytics.strategyPerformance)
                    .sort(([,a], [,b]) => b.totalPnL - a.totalPnL)
                    .slice(0, 3)
                    .map(([strategy, data]) => (
                      <div key={strategy} className="flex items-center justify-between">
                        <span className="text-sm text-dark-textSecondary">{strategy}</span>
                        <span className={`text-sm font-medium ${data.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(data.totalPnL)}
                        </span>
                      </div>
                    ))}
                  {Object.keys(analytics.strategyPerformance).length === 0 && (
                    <div className="text-sm text-dark-textSecondary">No strategy data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card-dark p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Trading Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Best Performing Asset</h4>
                      <p className="text-sm text-dark-textSecondary">
                        {analytics.bestAsset ? `${analytics.bestAsset.asset} (${formatCurrency(analytics.bestAsset.pnl)})` : 'No data available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Most Profitable Strategy</h4>
                      <p className="text-sm text-dark-textSecondary">
                        {(() => {
                          const entries = Object.entries(analytics.strategyPerformance);
                          if (entries.length > 0) {
                            const sorted = entries.sort(([,a], [,b]) => b.totalPnL - a.totalPnL);
                            const [strategy, data] = sorted[0];
                            return `${strategy} (${formatCurrency(data.totalPnL)})`;
                          }
                          return 'No data available';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-danger-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Worst Performing Asset</h4>
                      <p className="text-sm text-dark-textSecondary">
                        {analytics.worstAsset ? `${analytics.worstAsset.asset} (${formatCurrency(analytics.worstAsset.pnl)})` : 'No data available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-warning-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Risk Level Analysis</h4>
                      <p className="text-sm text-dark-textSecondary">
                        {analytics.sharpeRatio > 1 ? 'Good risk-adjusted returns' : 
                         analytics.sharpeRatio > 0 ? 'Moderate risk-adjusted returns' : 
                         'Poor risk-adjusted returns'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 